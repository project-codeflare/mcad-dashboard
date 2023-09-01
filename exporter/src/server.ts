import express from 'express';
import { Gauge, register } from 'prom-client';
import axios from 'axios';
import { AllAppwrappers } from './appwrapper-utils';

const app = express();
const PORT = 9101;

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
            return 1;
        }
        case "Pending": {
            return 2;
        }
        case "Failed": {
            return 3;
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

        const counts = pullerJson.stats.status_counts;
        for (const status in counts) {
            //console.log(status, ":", counts[status])
            appwrapperCount.labels(status).set(counts[status]);
        }
        console.log("appwrapperCount", appwrapperCount)

        const appwrappers = pullerJson.appwrappers;
        for (const appwrapper in appwrappers) {
            const appwrapperInfo = appwrappers[appwrapper]
            console.log(appwrapper, appwrapperInfo)
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
