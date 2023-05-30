const { spawn } = require('child_process');
const http = require('http');

class AllNamespaces {
  async get() {
    const dtNow = new Date(Date.now());

    const jsonString: string = await this.pullJobs();
    const jsonStringList: string[] = this.matchNestedBraces(jsonString);

    const stats: { [key: string]: any } = {};
    const wrappers: { [key: string]: string } = {};
    const wrappersLite: { [key: string]: any } = {};
    const statusCounts = { Dispatched: 0, Queued: 0, 'Re-enqueued': 0, Other: 0 };

    let jsonData;
    for (let i = 0; i < jsonStringList.length; i++) {
      jsonData = JSON.parse(jsonStringList[i]);

      //Verify and set system priority
      if (jsonData.status.systempriority) {
        if (jsonData.spec.priority) {
          jsonData.status.systempriority = 'Not found';
        } else {
          jsonData.status.systempriority = jsonData.spec.priority;
        }
      }

      //Identify message in last status condition, if state is other than 'Running'
      const conditionsArr: any[] = jsonData.status.conditions;
      const lastCondition = conditionsArr[conditionsArr.length - 1];
      let message: string = '';

      message = message + lastCondition.type;
      message = message + '. Reason: ' + lastCondition.reason;
      if (lastCondition.message) {
        message = message + '\nMessage: ' + lastCondition.message;
      }

      jsonData.status.constructedMessage = message;

      // create formatted age
      let timestr: string = '';
      if (jsonData.metadata.creationTimestamp) {
        const dtCreation = new Date(jsonData.metadata.creationTimestamp);
        const delta = dtNow.getTime() - dtCreation.getTime();
        let deltasec = delta / 1000;
        const day = Math.trunc(deltasec / (24 * 3600));
        deltasec = deltasec % (24 * 3600);
        const hour = Math.trunc(deltasec / 3600);
        deltasec %= 3600;
        const minutes = Math.trunc(deltasec / 60);
        deltasec %= 60;
        const seconds = deltasec;
        timestr =
          day.toString() +
          'd ' +
          hour.toString() +
          'h ' +
          minutes.toString() +
          'm ' +
          Math.floor(seconds).toString() +
          's';
      } else {
        timestr = 'Not found';
      }
      jsonData.metadata.calculatedTimeSpent = timestr;

      // Identify status and add to counts
      let numRequeuings: number = 0;
      const state: string = jsonData.status.state.trim();
      let rephrasedState: string = '';
      if (state === '') {
        rephrasedState = 'Submitted';
        statusCounts.Other = statusCounts.Other + 1;
      } else if (state === 'Running') {
        rephrasedState = 'Dispatched';
        statusCounts.Dispatched = statusCounts.Dispatched + 1;
      } else if (state === 'Pending') {
        try {
          numRequeuings = jsonData.spec.schedulingSpec.requeuing.numRequeuings;
          if (Number(numRequeuings) > 0) {
            rephrasedState = 'Re-enqueued';
            statusCounts['Re-enqueued'] = statusCounts['Re-enqueued'] + 1;
          } else {
            rephrasedState = 'Queued';
            statusCounts.Queued = statusCounts.Queued + 1;
          }
        } catch (e) {
          rephrasedState = 'Queued';
          statusCounts.Queued = statusCounts.Queued + 1;
        }
      } else if (state === 'RunningHoldCompletion') {
        rephrasedState = 'CompletedWithRunningPods';
        statusCounts.Other = statusCounts.Other + 1;
      } else {
        rephrasedState = jsonData.status.state;
        statusCounts.Other = statusCounts.Other + 1;
      }
      jsonData.status.rephrasedState = rephrasedState;

      const wrapperKey: string =
        jsonData.metadata.name.toString() + jsonData.metadata.namespace.toString();
      wrappers[wrapperKey] = jsonData;

      const metaData = {
        creationTimestamp: jsonData.metadata.creationTimestamp,
        calculatedTimeSpent: jsonData.metadata.calculatedTimeSpent,
        name: jsonData.metadata.name,
        namespace: jsonData.metadata.namespace,
      };
      const status = {
        state: jsonData.status.state,
        systempriority: jsonData.status.systempriority,
        rephrasedState: jsonData.status.rephrasedState,
        numRequeuings: Number(numRequeuings),
        constructedMessage: jsonData.status.constructedMessage,
      };
      wrappersLite[wrapperKey] = { metadata: metaData, status: status };
    }

    stats['statusCounts'] = statusCounts;
    const finalJson = { stats: stats, appwrappers: wrappersLite };
    // maybe just return finalJson?
    const allNamespacesJson = JSON.stringify(finalJson);
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
    const response = {
      statusCode: 200,
      headers: headers,
      body: allNamespacesJson,
    };

    return response;
  }

  matchNestedBraces(input: string): string[] {
    const matches = [];
    let startIndex = input.indexOf('{');
    let endIndex = this.findMatchingClosingBrace(input, startIndex);

    while (startIndex !== -1 && endIndex !== -1) {
      matches.push(input.substring(startIndex, endIndex + 1));
      startIndex = input.indexOf('{', endIndex + 1);
      endIndex = this.findMatchingClosingBrace(input, startIndex);
    }

    return matches;
  }

  findMatchingClosingBrace(input: string, startIndex: number): number {
    let depth = 1;
    for (let i = startIndex + 1; i < input.length; i++) {
      if (input[i] === '{') {
        depth++;
      } else if (input[i] === '}') {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
    return -1;
  }

  pullJobs(): Promise<string> {
    return new Promise((resolve, reject) => {
      let jsonString: string = '';
      const child = spawn('sh', ['./backend/src/appwrapper_puller.sh'], {
        stdio: 'pipe',
        buffer: true,
      });

      child.stdout.on('data', (data: any) => {
        const res = data.toString();
        jsonString = jsonString + res;
      });

      child.stderr.on('data', (data: any) => {
        console.log(data.toString().trim());
      });

      child.on('close', (code: number) => {
        if (code === 0) {
          resolve(jsonString);
        } else {
          reject(`Error pulling jobs from cluster: ${code}`);
        }
      });
    });
  }
}

export { AllNamespaces };
