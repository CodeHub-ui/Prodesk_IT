const TABLE_PREVIEW_SIZE = 60;
self.onmessage = function handleMessage(event) {
  const message = event.data;

  if (!message || typeof message !== 'object') {
    postError('Worker received a malformed message (expected an object).');
    return;
  }

  switch (message.type) {
    case 'PROCESS_DATA':
      processData(message.payload);
      break;
    default:
      postError(`Worker received an unrecognized message type: "${message.type}".`);
  }
};
self.onerror = function (event) {
  postError(`Uncaught worker error: ${event.message}`);
};

function processData(payload) {
  const start = performance.now();

  try {
    if (!payload || !Array.isArray(payload.records) || payload.records.length === 0) {
      throw new Error('No source records were provided to expand and process.');
    }

    const targetCount = clamp(Number(payload.targetCount) || 10000, 1000, 50000);

    postProgress('expanding', 5);
    const expanded = expandDataset(payload.records, targetCount);

    postProgress('filtering', 45);
    const filtered = filterRecords(expanded);

    postProgress('sorting', 70);
    const sorted = sortRecords(filtered);

    postProgress('aggregating', 90);
    const statistics = computeStatistics(sorted, expanded.length);

    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    statistics.durationMs = durationMs;

    postProgress('aggregating', 100);

    self.postMessage({
      type: 'PROCESS_SUCCESS',
      payload: {
        records: sorted.slice(0, TABLE_PREVIEW_SIZE),
        statistics
      }
    });
  } catch (err) {
    postError(err && err.message ? err.message : 'Unknown error during data processing.');
  }
}

function expandDataset(baseRecords, targetCount) {
  const expanded = new Array(targetCount);

  for (let i = 0; i < targetCount; i++) {
    const base = baseRecords[i % baseRecords.length];

    const seed = (i * 2654435761) % 1000 / 1000;

    expanded[i] = {
      id: i + 1,
      name: base.name || 'Unknown',
      username: `${base.username || 'user'}_${i}`,
      email: base.email || `unknown${i}@example.com`,
      company: (base.company && base.company.name) || 'Unassigned',

      isValid: seed > 0.04,
      status: seed > 0.82 ? 'flagged' : 'active',
      riskScore: Math.round(seed * 1000) / 10  
    };
  }

  return expanded;
}
function filterRecords(records) {
  return records.filter((r) => r.isValid && r.email && r.name);
}
function sortRecords(records) {
  return records.slice().sort((a, b) => b.riskScore - a.riskScore);
}

function computeStatistics(filteredRecords, totalGenerated) {
  const companyCounts = new Map();
  let activeCount = 0;
  let flaggedCount = 0;

  for (const record of filteredRecords) {
    if (record.status === 'active') activeCount++;
    if (record.status === 'flagged') flaggedCount++;

    const count = companyCounts.get(record.company) || 0;
    companyCounts.set(record.company, count + 1);
  }

  let topCompany = '—';
  let topCount = 0;
  for (const [company, count] of companyCounts.entries()) {
    if (count > topCount) {
      topCompany = company;
      topCount = count;
    }
  }

  return {
    totalGenerated,
    totalAfterFilter: filteredRecords.length,
    activeCount,
    flaggedCount,
    uniqueCompanies: companyCounts.size,
    topCompany
  };
}

function postProgress(stage, percent) {
  self.postMessage({ type: 'PROCESS_PROGRESS', payload: { stage, percent } });
}

function postError(errorMessage) {
  self.postMessage({ type: 'PROCESS_ERROR', error: errorMessage });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
