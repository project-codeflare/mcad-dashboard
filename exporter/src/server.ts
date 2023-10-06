import express from 'express';
import { Gauge, register } from 'prom-client';
import http from 'http'
import { AllAppwrappers } from './appwrapper-utils';
import * as k8s from '@kubernetes/client-node';
import * as fs from 'fs';

const app = express();
const PORT = 9101;

/** configure kube connection **/
const isRunningInKubernetes = process.env.KUBERNETES_SERVICE_HOST;
const kc = new k8s.KubeConfig();
if (isRunningInKubernetes) {
    const token = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
    kc.loadFromCluster();
} else {
    kc.loadFromDefault();
}
const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
console.log(`connected to kubernetes... testing appwrapper call`);
// test k8s
const list = k8sApi.listClusterCustomObject('workload.codeflare.dev', 'v1beta1', 'appwrappers');
list.then((res) => {
    console.log(`test resuld: ${res}`)
})
console.log(`finished kubernetes connection test`);

interface AppwrapperObject extends k8s.KubernetesObject {
    metadata: {
        name: string;
        namespace: string;
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
    labelNames: ['appwrapper_name', 'appwrapper_namespace'],
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
console.log(`initializing prometheus metrics`);
appwrapperCountMetric.labels("Running").set(0);
appwrapperCountMetric.labels("Pending").set(0);
appwrapperCountMetric.labels("Failed").set(0);
appwrapperCountMetric.labels("Other").set(0);

/** END initialize prometheus metrics **/

/** initialize informer **/
console.log(`initializing informer`)
async function listFn(): Promise<{ response: http.IncomingMessage; body: k8s.KubernetesListObject<AppwrapperObject>;  }>{
    const list = await k8sApi.listClusterCustomObject('workload.codeflare.dev', 'v1beta1', 'appwrappers');
    let k8sBody = list.body as k8s.KubernetesListObject<AppwrapperObject>;
    let value = {response: list.response, body: k8sBody};
    let returnedPromise: Promise<{ response: http.IncomingMessage; body: k8s.KubernetesListObject<AppwrapperObject>;  }> = new Promise((resolve, reject) => {
        resolve(value);
    })
    console.log(`listFN called: ${returnedPromise}, ${value}, ${list.response}, ${k8sBody}`);
    return returnedPromise
}

const informer = k8s.makeInformer(kc, '/apis/workload.codeflare.dev/v1beta1/appwrappers', listFn);
informer.on('change', (obj) => {
    //console.log(`hello ch!`);
    //console.log(`changed: ${obj.metadata.name}`);
    let appwrapperName: string = obj.metadata.name;
    let appwrapperNamespace = obj.metadata.namespace;
    let appwrapperStatus = obj.status.state;
    appwrapperStatusMetric.labels(appwrapperName, appwrapperNamespace).set(getAppwrapperStatus(appwrapperStatus))
});
informer.on('delete', (obj) => {
    //console.log(`hello de!`);
    //console.log(`deled: ${obj.metadata.name}`);
    let appwrapperName: string = obj.metadata.name;
    let appwrapperNamespace = obj.metadata.namespace;
    //let metricName = `appwrapper_status{appwrapper_name="${appwrapperName}",appwrapper_namespace="${appwrapperNamespace}"}`;
    //metricName = `appwrapper_status{appwrapper_name="0001-aw-generic-deployment-3-5",appwrapper_namespace="test1"}`;
    //console.log(metricName)
    //register.removeSingleMetric(metricName);
    appwrapperStatusMetric.labels(appwrapperName, appwrapperNamespace).set(NaN)

});
informer.on('error', (err) => {
    console.log(`hello e!`);
    console.log(`errord: ${err}`);
});
informer.on('connect', (err) => {
    console.log(`hello c!`);
    console.log(`connected: ${err}`);
});

// start informer
informer.start();
console.log(`informer started...`);

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
