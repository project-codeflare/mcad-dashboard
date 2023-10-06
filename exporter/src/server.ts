import express from 'express';
import { Gauge, register } from 'prom-client';
import axios from 'axios';
import http from 'http'
import { AllAppwrappers } from './appwrapper-utils';
import * as k8s from '@kubernetes/client-node';

const app = express();
const PORT = 9101;
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

interface AppwrapperObject extends k8s.KubernetesObject {
    status: {
        state: string;
        queuejobstate: string;
    };
}

async function listFn(): Promise<{ response: http.IncomingMessage; body: k8s.KubernetesListObject<AppwrapperObject>;  }>{
    const list = await k8sApi.listClusterCustomObject('workload.codeflare.dev', 'v1beta1', 'appwrappers');
    let k8sBody = list.body as k8s.KubernetesListObject<AppwrapperObject>;
    let value = {response: list.response, body: k8sBody};
    let returnedPromise: Promise<{ response: http.IncomingMessage; body: k8s.KubernetesListObject<AppwrapperObject>;  }> = new Promise((resolve, reject) => {
        resolve(value);
    })
    return returnedPromise
}
//const listFn = () => getappwrapper();
/*let x = listFn();
console.log('testing listfn with x', x);
x.then(function(result) {
    console.log(result);
    console.log(result.body)
})*/
const informer = k8s.makeInformer(kc, '/apis/workload.codeflare.dev/v1beta1/appwrappers', listFn);
informer.on('change', (obj) => {
    console.log(`hello ch!`);
    console.log(`changed: ${obj.metadata!.name}`);
    console.log(`kind: ${obj.kind}`)
    console.log(obj.status.state);
});
informer.on('error', (err) => {
    console.log(`hello e!`);
    console.log(`errord: ${err}`);
});
informer.on('connect', (err) => {
    console.log(`hello c!`);
    console.log(`connected: ${err}`);
});
informer.start();

// Define a custom metric for appwrapper count
const appwrapperCount = new Gauge({
    name: 'appwrapper_count',
    help: 'Shows number of appwrappers in each state',
    labelNames: ['status'],
});

// Define a custom metric for appwrapper status - for future metric
const appwrapperStatus = new Gauge({
    name: 'appwrapper_status',
    help: 'Shows status of appwrapper by int',
    labelNames: ['appwrapper_name', 'appwrapper_namespace'],
});

async function getAppwrapperStatus(status: string) {
    switch(status) {
        case "Running": {
            return 3;
        }
        case "Pending": {
            return 2;
        }
        case "Failed": {
            return 1;
        }
        default: {
            return 0;
        }
    }
}

// Define a function to collect stats and update Prometheus metrics
async function collectStats() {
    try {
        const response = await new AllAppwrappers().get();
        const pullerJson = JSON.parse(response.body);

        const counts = pullerJson.stats.statusCounts;
        for (const status in counts) {
            //console.log(status, ":", counts[status])
            appwrapperCount.labels(status).set(counts[status]);
        }

        const appwrappers = pullerJson.appwrappers;
        for (const appwrapper in appwrappers) {
            const appwrapperInfo = appwrappers[appwrapper]
            //console.log(appwrapper, appwrapperInfo)
            var state = getAppwrapperStatus(appwrapperInfo.status.state)
            appwrapperStatus.labels(appwrapperInfo.metadata.name, appwrapperInfo.metadata.namespace).set(await state)
        }
    } catch (error) {
        console.error('Error fetching data:', (error as Error).message);
    }
}

// Define a function to periodically collect stats
function scheduleStatsCollection() {
    setInterval(collectStats, 30000); // Collect every 30 seconds
}

// Start collecting stats
scheduleStatsCollection();

// Expose metrics endpoint for Prometheus scraping
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics(); // Await for the promise to resolve
        res.end(metrics); // Send the resolved metrics string
    } catch (error) {
        console.error('Error sending metrics:', error);
        res.status(500).send('Error sending metrics');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
