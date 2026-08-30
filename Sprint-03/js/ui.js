(function () {
  'use strict';
  const el = {
    globalDot: document.getElementById('global-status-dot'),
    globalText: document.getElementById('global-status-text'),

    pipelineTrack: document.getElementById('pipeline-track'),

    kpiApiStatus: document.getElementById('kpi-api-status'),
    kpiApiHint: document.getElementById('kpi-api-hint'),
    kpiRecordsLoaded: document.getElementById('kpi-records-loaded'),
    kpiRecordsProcessed: document.getElementById('kpi-records-processed'),
    kpiProcessingTime: document.getElementById('kpi-processing-time'),

    apiPill: document.getElementById('api-request-pill'),
    apiEndpointValue: document.getElementById('api-endpoint-value'),
    apiPanelBody: document.getElementById('api-panel-body'),

    workerPill: document.getElementById('worker-status-pill'),
    workerRecordsValue: document.getElementById('worker-records-value'),
    workerDurationValue: document.getElementById('worker-duration-value'),
    workerPanelBody: document.getElementById('worker-panel-body'),
    workerProgress: document.getElementById('worker-progress'),
    workerProgressFill: document.getElementById('worker-progress-fill'),

    tableCount: document.getElementById('table-count'),
    tableBody: document.getElementById('data-table-body'),

    btnLoadData: document.getElementById('btn-load-data'),
    btnProcessLarge: document.getElementById('btn-process-large'),
    btnSimulateError: document.getElementById('btn-simulate-error'),
    btnSimulateTimeout: document.getElementById('btn-simulate-timeout')
  };

  function setGlobalStatus(state, text) {
    el.globalDot.dataset.state = state;
    el.globalText.textContent = text;
  }


  const STAGE_ORDER = ['request', 'guard', 'expand', 'worker', 'render'];

  function resetPipeline() {
    STAGE_ORDER.forEach((stage) => setPipelineStage(stage, 'pending'));
  }

  function setPipelineStage(stageName, state) {
    const node = el.pipelineTrack.querySelector(`[data-stage="${stageName}"]`);
    if (node) node.dataset.state = state; 
  }


  function failPipelineFrom(stageName) {
    const idx = STAGE_ORDER.indexOf(stageName);
    STAGE_ORDER.forEach((stage, i) => {
      if (i < idx) return; 
      setPipelineStage(stage, i === idx ? 'failed' : 'pending');
    });
  }

  function updateKpis(partial) {
    if ('apiStatus' in partial) el.kpiApiStatus.textContent = partial.apiStatus;
    if ('apiHint' in partial) el.kpiApiHint.textContent = partial.apiHint;
    if ('recordsLoaded' in partial) el.kpiRecordsLoaded.textContent = formatNumber(partial.recordsLoaded);
    if ('recordsProcessed' in partial) el.kpiRecordsProcessed.textContent = formatNumber(partial.recordsProcessed);
    if ('processingTime' in partial) el.kpiProcessingTime.textContent = partial.processingTime;
  }


  function showApiSkeleton() {
    el.apiPill.dataset.state = 'loading';
    el.apiPill.textContent = 'Loading';
    el.apiPanelBody.innerHTML = `
      <div class="skeleton-block" aria-hidden="true">
        <div class="skeleton-line skeleton-line--sm"></div>
        <div class="skeleton-line skeleton-line--lg"></div>
        <div class="skeleton-line skeleton-line--md"></div>
        <div class="skeleton-line skeleton-line--sm"></div>
      </div>
      <p class="empty-hint">Contacting the API service&hellip;</p>
    `;
  }

  function showApiSuccess({ endpoint, count }) {
    el.apiPill.dataset.state = 'success';
    el.apiPill.textContent = 'Connected';
    el.apiEndpointValue.textContent = endpoint;
    el.apiPanelBody.innerHTML = `
      <p class="empty-hint">Received <strong>${formatNumber(count)}</strong> records from the endpoint above. Handing off to the expansion + Worker stage.</p>
    `;
  }

  function showApiError(apiError, onRetry) {
    el.apiPill.dataset.state = 'error';
    el.apiPill.textContent = 'Error';
    const status = apiError && apiError.meta && apiError.meta.status;
    el.apiPanelBody.innerHTML = `
      <div class="state-card state-card--error" role="alert">
        <span class="state-card__title">Service Unavailable</span>
        <p class="state-card__body">We couldn't reach the API service. ${status ? `The server responded with status ${status}.` : 'The request could not be completed.'}</p>
        <span class="state-card__meta">type: ${apiError.type}${apiError.meta && apiError.meta.simulated ? ' · simulated' : ''}</span>
        <button type="button" class="btn btn--secondary btn--small" id="api-retry-btn">Retry</button>
      </div>
    `;
    document.getElementById('api-retry-btn').addEventListener('click', onRetry);
  }

  function showApiTimeout(apiError, onRetry) {
    el.apiPill.dataset.state = 'timeout';
    el.apiPill.textContent = 'Timeout';
    el.apiPanelBody.innerHTML = `
      <div class="state-card state-card--timeout" role="alert">
        <span class="state-card__title">Request Timed Out</span>
        <p class="state-card__body">Unable to receive a response within 5 seconds.</p>
        <span class="state-card__meta">type: timeout${apiError && apiError.meta && apiError.meta.simulated ? ' · simulated' : ''}</span>
        <button type="button" class="btn btn--secondary btn--small" id="api-retry-btn">Retry</button>
      </div>
    `;
    document.getElementById('api-retry-btn').addEventListener('click', onRetry);
  }


  function showWorkerIdle() {
    el.workerPill.dataset.state = 'idle';
    el.workerPill.textContent = 'Idle';
    el.workerPanelBody.innerHTML = `<p class="empty-hint">The Worker starts automatically once API data loads.</p>`;
    setWorkerProgress(0);
  }

  function showWorkerSkeleton() {
    el.workerPill.dataset.state = 'loading';
    el.workerPill.textContent = 'Starting';
    el.workerPanelBody.innerHTML = `
      <div class="skeleton-block" aria-hidden="true">
        <div class="skeleton-line skeleton-line--md"></div>
        <div class="skeleton-line skeleton-line--sm"></div>
      </div>
    `;
    setWorkerProgress(2);
  }

  const STAGE_LABELS = {
    expanding: 'Expanding dataset',
    filtering: 'Filtering records',
    sorting: 'Sorting records',
    aggregating: 'Calculating statistics'
  };

  function showWorkerProgress({ stage, percent, recordCount }) {
    el.workerPill.dataset.state = 'loading';
    el.workerPill.textContent = 'Processing';
    const label = STAGE_LABELS[stage] || 'Processing';
    el.workerPanelBody.innerHTML = `
      <p class="empty-hint">${label} for ${formatNumber(recordCount)} records&hellip;</p>
    `;
    setWorkerProgress(percent);
  }

  function showWorkerSuccess(statistics) {
    el.workerPill.dataset.state = 'success';
    el.workerPill.textContent = 'Completed';
    el.workerRecordsValue.textContent = formatNumber(statistics.totalAfterFilter);
    el.workerDurationValue.textContent = `${statistics.durationMs} ms`;
    el.workerPanelBody.innerHTML = `
      <p class="empty-hint">
        ${formatNumber(statistics.totalGenerated)} records generated &middot;
        ${formatNumber(statistics.totalAfterFilter)} passed filtering &middot;
        ${formatNumber(statistics.activeCount)} active / ${formatNumber(statistics.flaggedCount)} flagged &middot;
        top company: <strong>${escapeHtml(statistics.topCompany)}</strong>
      </p>
    `;
    setWorkerProgress(100);
  }

  function showWorkerError(message) {
    el.workerPill.dataset.state = 'error';
    el.workerPill.textContent = 'Error';
    el.workerPanelBody.innerHTML = `
      <div class="state-card state-card--error" role="alert">
        <span class="state-card__title">Worker Processing Failed</span>
        <p class="state-card__body">${escapeHtml(message)}</p>
      </div>
    `;
    setWorkerProgress(0);
  }

  function setWorkerProgress(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    el.workerProgressFill.style.width = `${clamped}%`;
    el.workerProgress.setAttribute('aria-valuenow', String(Math.round(clamped)));
  }


  function showTableSkeleton(rows = 6) {
    let html = '';
    for (let i = 0; i < rows; i++) {
      html += `
        <tr>
          <td colspan="6">
            <div class="skeleton-table-row" aria-hidden="true">
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
            </div>
          </td>
        </tr>
      `;
    }
    el.tableBody.innerHTML = html;
  }

  function showTableEmpty(message) {
    el.tableBody.innerHTML = `<tr class="table-empty-row"><td colspan="6">${escapeHtml(message)}</td></tr>`;
    el.tableCount.textContent = '0 rows';
  }


  function renderTable(records, totalProcessed) {
    if (!records || records.length === 0) {
      showTableEmpty('No records matched after filtering.');
      return;
    }

    const fragment = document.createDocumentFragment();

    records.forEach((record) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="cell-mono">${record.id}</td>
        <td>${escapeHtml(record.name)}</td>
        <td class="cell-mono">${escapeHtml(record.username)}</td>
        <td class="cell-mono">${escapeHtml(record.email)}</td>
        <td>${escapeHtml(record.company)}</td>
        <td>${statusChip(record.status)}</td>
      `;
      fragment.appendChild(row);
    });

    el.tableBody.innerHTML = '';
    el.tableBody.appendChild(fragment);
    el.tableCount.textContent = `Showing ${formatNumber(records.length)} of ${formatNumber(totalProcessed)} processed rows`;
  }

  function statusChip(status) {
    if (status === 'active') return `<span class="status-chip status-chip--active">active</span>`;
    if (status === 'flagged') return `<span class="status-chip status-chip--flagged">flagged</span>`;
    return `<span class="status-chip">${escapeHtml(status || 'unknown')}</span>`;
  }

  function setButtonsBusy(isBusy) {
    el.btnLoadData.disabled = isBusy;
    el.btnSimulateError.disabled = isBusy;
    el.btnSimulateTimeout.disabled = isBusy;
  }

  function setProcessLargeEnabled(enabled) {
    el.btnProcessLarge.disabled = !enabled;
  }


  function formatNumber(n) {
    return Number(n || 0).toLocaleString('en-US');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  window.UI = {
    elements: el,
    setGlobalStatus,
    resetPipeline,
    setPipelineStage,
    failPipelineFrom,
    updateKpis,
    showApiSkeleton,
    showApiSuccess,
    showApiError,
    showApiTimeout,
    showWorkerIdle,
    showWorkerSkeleton,
    showWorkerProgress,
    showWorkerSuccess,
    showWorkerError,
    showTableSkeleton,
    showTableEmpty,
    renderTable,
    setButtonsBusy,
    setProcessLargeEnabled
  };
})();
