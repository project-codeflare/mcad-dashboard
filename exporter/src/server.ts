import express from 'express';
import { Gauge, register } from 'prom-client';
import http from 'http'
import * as k8s from '@kubernetes/client-node';

const app = express();
const PORT = 9101;

/** configure kube connection **/
const isRunningInKubernetes = process.env.KUBERNETES_SERVICE_HOST;
const kc = new k8s.KubeConfig();
if (isRunningInKubernetes) {
    kc.loadFromCluster();
    console.log(`Connected to k8s api via cluster credentials`);
} else {
    kc.loadFromDefault();
    console.log(`Connected to k8s api via local kubeconfig`);
}
const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);

interface AppwrapperObject extends k8s.KubernetesObject {
    metadata: {
        name: string;
        namespace: string;
        uid: string;
    }
    status: {
        state: string;
        queuejobstate: string;
    };
}

/** BEGIN initialize Prometheus metrics **/

// Define a custom metric for appwrapper count
const appwrapperCountMetric = new Gauge({
    name: 'appwrapper_count',
    help: 'Shows number of appwrappers in each state',
    labelNames: ['status'],
});

// Define a custom metric for appwrapper status - for future metric
const appwrapperStatusMetric = new Gauge({
    name: 'appwrapper_status',
    help: 'Shows status of appwrapper by int',
    labelNames: ['appwrapper_name', 'appwrapper_namespace', 'appwrapper_UID'],
});

function getAppwrapperStatus(status: string) {
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
        default: { // unknown state
            return 0;
        }
    }
}

// initialize count metrics
console.log(`Initializing Prometheus metrics`);
appwrapperCountMetric.labels("Running").set(0);
appwrapperCountMetric.labels("Pending").set(0);
appwrapperCountMetric.labels("Failed").set(0);
appwrapperCountMetric.labels("Other").set(0);

/** END initialize prometheus metrics **/

/** initialize informer **/
// need to store previous state for each appwrapper so that upon change we can update labels
// the key is `<appwrapper_namespace>,<appwrapper_name>` as a string
// this assumes commas are not included in namespaces names or appwrapper names
const previousAppwrapperStates: Map<string, string> = new Map();

console.log(`Initializing informer`)
async function listFn(): Promise<{ response: http.IncomingMessage; body: k8s.KubernetesListObject<AppwrapperObject>;  }>{
    const list = await k8sApi.listClusterCustomObject('workload.codeflare.dev', 'v1beta1', 'appwrappers');
    let k8sBody = list.body as k8s.KubernetesListObject<AppwrapperObject>;
    let value = {response: list.response, body: k8sBody};
    let returnedPromise: Promise<{ response: http.IncomingMessage; body: k8s.KubernetesListObject<AppwrapperObject>;  }> = new Promise((resolve, reject) => {
        resolve(value);
    })
    return returnedPromise
}

const informer = k8s.makeInformer(kc, '/apis/workload.codeflare.dev/v1beta1/appwrappers', listFn);
informer.on('add', (obj) => {
    let appwrapperName: string = obj.metadata.name;
    let appwrapperNamespace = obj.metadata.namespace;
    let appwrapperUID = obj.metadata.uid;
    let appwrapperStatus = obj.status.state;
    appwrapperStatusMetric.labels(appwrapperName, appwrapperNamespace, appwrapperUID).set(getAppwrapperStatus(appwrapperStatus))
    appwrapperCountMetric.labels(appwrapperStatus).inc(1);
    // set previous state
    previousAppwrapperStates.set(`${appwrapperNamespace},${appwrapperName},${appwrapperUID}`, appwrapperStatus);
});
informer.on('update', (obj) => {
    let appwrapperName: string = obj.metadata.name;
    let appwrapperNamespace = obj.metadata.namespace;
    let appwrapperUID = obj.metadata.uid;
    let appwrapperStatus = obj.status.state;
    //console.log(`update received: ${appwrapperName}, ${appwrapperNamespace}, ${appwrapperStatus}`);
    appwrapperStatusMetric.labels(appwrapperName, appwrapperNamespace, appwrapperUID).set(getAppwrapperStatus(appwrapperStatus))
    // decrement count of previous state
    let previousState = previousAppwrapperStates.get(`${appwrapperNamespace},${appwrapperName},${appwrapperUID}`);
    if (!previousState) {
        console.log(`error: update received but no previous state recorded`)
        return;
    }
    appwrapperCountMetric.labels(previousState).dec(1);
    appwrapperCountMetric.labels(appwrapperStatus).inc(1);
    // set previous state
    previousAppwrapperStates.set(`${appwrapperNamespace},${appwrapperName},${appwrapperUID}`, appwrapperStatus);
});
informer.on('delete', (obj) => {
    let appwrapperName: string = obj.metadata.name;
    let appwrapperNamespace = obj.metadata.namespace;
    let appwrapperUID = obj.metadata.uid;
    let appwrapperStatus = obj.status.state;
    // Prometheus does not support removing a single tagged series
    // Instead, we set to NaN to effectively end the series, as shown in Prometheus charts
    // NOTE: Consequently, when querying Prometheus, if one appwrapper is added and deleted with same 
    // name and namespace multiple times, a query may get information for both
    appwrapperStatusMetric.labels(appwrapperName, appwrapperNamespace, appwrapperUID).set(-1)
    appwrapperCountMetric.labels(appwrapperStatus).dec(1);
    // set previous state
    previousAppwrapperStates.delete(`${appwrapperNamespace},${appwrapperName},${appwrapperUID}`);
});
informer.on('error', (err) => {
    console.log(`Informer errored: ${err}`);
    console.log(`NOTE: if the above error says "forbidden" check you or the relevant deployment has permission to "watch" appwrappers`);

});
informer.on('connect', (err) => {
    console.log(`Informer connected!`);
});

// start informer
informer.start();
console.log(`Informer started watching...`);

/** end initialize informer **/

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
