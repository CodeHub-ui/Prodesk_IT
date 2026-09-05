const { getAllRecords, addRecord } = require("../data/recordsStore");
const { sanitizeText } = require("../utils/sanitizeText");

function getRecords(req, res) {
  const records = getAllRecords();
  res.status(200).json({
    success: true,
    data: records,
  });
}

function createRecord(req, res) {
  const { employeeName, employeeId, department, testScore, remarks } = req.body;

  const cleanRecord = {
    employeeName: sanitizeText(employeeName.trim()),
    employeeId: sanitizeText(employeeId.trim()),
    department: sanitizeText(department.trim()),
    testScore: testScore === undefined || testScore === "" ? null : Number(testScore),
    remarks: sanitizeText((remarks || "").trim()),
  };

  const newRecord = addRecord(cleanRecord);

  res.status(201).json({
    success: true,
    data: newRecord,
  });
}

module.exports = { getRecords, createRecord };
