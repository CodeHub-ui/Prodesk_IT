let records = [];
let nextId = 1;

function getAllRecords() {
  return records;
}

function addRecord(record) {
  const newRecord = {
    id: nextId++,
    ...record,
    createdAt: new Date().toISOString(),
  };
  records.push(newRecord);
  return newRecord;
}

module.exports = {
  getAllRecords,
  addRecord,
};
