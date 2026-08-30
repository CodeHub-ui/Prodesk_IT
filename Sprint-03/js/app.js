
(function () {
  'use strict';

  const DEFAULT_EXPANSION_COUNT = 25000; 
  const LARGE_EXPANSION_COUNT = 50000; 
  
  const state = {
    lastFetchedRecords: null, 
    worker: null 
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    UI.resetPipeline();
    UI.showWorkerIdle();

    UI.elements.btnLoadData.addEventListener('click', () => {
      runApiRequest(ApiLayer.fetchUsers, { simulated: false });
    });

    UI.elements.btnSimulateError.addEventListener('click', () => {
      runApiRequest(ApiLayer.simulateHttpError, { simulated: true });
    });

    UI.elements.btnSimulateTimeout.addEventListener('click', () => {
      runApiRequest(ApiLayer.simulateTimeout, { simulated: true });
    });

    UI.elements.btnProcessLarge.addEventListener('click', () => {
      if (!state.lastFetchedRecords) return;  
      runWorkerProcessing(state.lastFetchedRecords, LARGE_EXPANSION_COUNT);
    });


    window.addEventListener('beforeunload', () => {
      if (state.worker) state.worker.terminate();
    });
  }


  async function runApiRequest(requestFn, { simulated }) {
    UI.setButtonsBusy(true);
    UI.setProcessLargeEnabled(false);
    UI.resetPipeline();
    UI.setPipelineStage('request', 'active');
    UI.setGlobalStatus('loading', simulated ? 'Simulating request…' : 'Requesting data…');
    UI.showApiSkeleton();
    UI.showTableSkeleton();
    UI.showWorkerIdle();
    UI.updateKpis({
      apiStatus: 'Loading',
      apiHint: simulated ? 'Simulated request in progress' : 'Contacting endpoint',
      recordsLoaded: 0,
      recordsProcessed: 0,
      processingTime: '—'
    });

    try {
      const { data, endpoint } = await requestFn();

      UI.setPipelineStage('request', 'done');
      UI.setPipelineStage('guard', 'done');
      UI.setGlobalStatus('success', 'Data received');
      UI.showApiSuccess({ endpoint, count: data.length });
      UI.updateKpis({
        apiStatus: 'Online',
        apiHint: `${data.length} records fetched`,
        recordsLoaded: data.length
      });

      state.lastFetchedRecords = data;
      UI.setButtonsBusy(false);


      await runWorkerProcessing(data, DEFAULT_EXPANSION_COUNT);
    } catch (err) {
      UI.setButtonsBusy(false);
      handleApiFailure(err, () => runApiRequest(requestFn, { simulated }));
    }
  }


  function handleApiFailure(err, retry) {
    const isTimeout = err && err.type === 'timeout';

    if (isTimeout) {

      UI.setPipelineStage('request', 'done');
      UI.failPipelineFrom('guard');
      UI.setGlobalStatus('timeout', 'Request timed out');
      UI.showApiTimeout(err, retry);
      UI.updateKpis({ apiStatus: 'Timeout', apiHint: 'No response within 5000ms' });
    } else {
      UI.failPipelineFrom('request');
      UI.setGlobalStatus('error', 'Request failed');
      UI.showApiError(err, retry);
      const hint = err && err.type === 'http' ? `HTTP ${err.meta && err.meta.status}` : (err && err.type) || 'unknown error';
      UI.updateKpis({ apiStatus: 'Error', apiHint: hint });
    }

    UI.showTableEmpty('No records available — the last request did not complete.');
    UI.showWorkerIdle();
    state.lastFetchedRecords = null;
    UI.setProcessLargeEnabled(false);
  }


  async function createWorker(scriptUrl) {
    const response = await fetch(scriptUrl);
    if (!response.ok) {
      throw new Error(`Could not load ${scriptUrl} (HTTP ${response.status}).`);
    }
    const sourceCode = await response.text();
    const blob = new Blob([sourceCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);

    URL.revokeObjectURL(blobUrl);
    return worker;
  }


  async function runWorkerProcessing(baseRecords, targetCount) {

    if (state.worker) {
      state.worker.terminate();
      state.worker = null;
    }

    UI.setButtonsBusy(true);
    UI.setProcessLargeEnabled(false);
    UI.setPipelineStage('expand', 'active');
    UI.showWorkerSkeleton();
    UI.setGlobalStatus('loading', `Processing ${targetCount.toLocaleString('en-US')} records…`);

    let worker;
    try {
      worker = await createWorker('js/worker.js');
    } catch (err) {
    
      UI.failPipelineFrom('expand');
      UI.showWorkerError(err && err.message ? err.message : 'Web Workers are not available in this browser.');
      UI.setGlobalStatus('error', 'Worker unavailable');
      finishProcessingRun();
      return;
    }

    state.worker = worker;

    return new Promise((resolve) => {

      worker.onmessage = (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') {
          UI.showWorkerError('Received an unrecognized message from the worker.');
          terminateAndFinish();
          resolve();
          return;
        }

        if (msg.type === 'PROCESS_PROGRESS') {
          const stage = msg.payload.stage;
          UI.setPipelineStage('expand', stage === 'expanding' ? 'active' : 'done');
          UI.setPipelineStage('worker', stage === 'expanding' ? 'pending' : 'active');
          UI.showWorkerProgress({ stage, percent: msg.payload.percent, recordCount: targetCount });
          return;
        }

        if (msg.type === 'PROCESS_SUCCESS') {
          const { records, statistics } = msg.payload;
          UI.setPipelineStage('expand', 'done');
          UI.setPipelineStage('worker', 'done');
          UI.setPipelineStage('render', 'active');

          UI.showWorkerSuccess(statistics);
          UI.renderTable(records, statistics.totalAfterFilter);
          UI.updateKpis({
            recordsProcessed: statistics.totalAfterFilter,
            processingTime: `${statistics.durationMs} ms`
          });

          UI.setPipelineStage('render', 'done');
          UI.setGlobalStatus('success', 'Pipeline complete');
          terminateAndFinish();
          resolve();
          return;
        }

        if (msg.type === 'PROCESS_ERROR') {
          UI.failPipelineFrom('worker');
          UI.showWorkerError(msg.error || 'The worker reported an unknown error.');
          UI.setGlobalStatus('error', 'Worker processing failed');
          terminateAndFinish();
          resolve();
          return;
        }

 
        UI.showWorkerError(`Unexpected message type from worker: "${msg.type}".`);
        terminateAndFinish();
        resolve();
      };

      worker.onerror = (event) => {
        UI.failPipelineFrom('worker');
        UI.showWorkerError(event.message || 'The worker crashed unexpectedly.');
        UI.setGlobalStatus('error', 'Worker crashed');
        terminateAndFinish();
        resolve();
      };

      worker.postMessage({
        type: 'PROCESS_DATA',
        payload: { records: baseRecords, targetCount }
      });

      function terminateAndFinish() {
        worker.terminate();
        state.worker = null;
        finishProcessingRun();
      }
    });
  }
 
  function finishProcessingRun() {
    UI.setButtonsBusy(false);
    UI.setProcessLargeEnabled(Boolean(state.lastFetchedRecords));
  }
})();
