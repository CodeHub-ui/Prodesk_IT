function validateRecord(req, res, next) {
  const { employeeName, employeeId, department, testScore } = req.body;
  const errors = {};

  if (!employeeName || !employeeName.trim()) {
    errors.employeeName = "Employee name is required";
  }

  if (!employeeId || !employeeId.trim()) {
    errors.employeeId = "Employee ID is required";
  }

  if (!department || !department.trim()) {
    errors.department = "Department is required";
  }

  if (testScore !== undefined && testScore !== null && testScore !== "") {
    const score = Number(testScore);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      errors.testScore = "Test score must be a number between 0 and 100";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
}

module.exports = validateRecord;
