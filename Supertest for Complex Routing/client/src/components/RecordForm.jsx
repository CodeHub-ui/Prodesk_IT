import { useState } from "react";
import { createRecord } from "../services/supertestApi.js";

const EMPTY_FORM = {
  employeeName: "",
  employeeId: "",
  department: "",
  testScore: "",
  remarks: "",
};

function RecordForm({ onRecordCreated }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
     
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate() {
    const errors = {};

    if (!formData.employeeName.trim()) {
      errors.employeeName = "Employee name is required";
    }
    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
    }
    if (!formData.department.trim()) {
      errors.department = "Department is required";
    }
    if (formData.testScore !== "") {
      const score = Number(formData.testScore);
      if (Number.isNaN(score) || score < 0 || score > 100) {
        errors.testScore = "Test score must be a number between 0 and 100";
      }
    }

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    setSubmitError("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newRecord = await createRecord(formData);
 
      console.log("[Analytics] User interacted with Supertest");

      onRecordCreated(newRecord);
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(err.fieldErrors);
      } else {
        setSubmitError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">New Supertest Record</h2>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="employeeName">Employee Name</label>
          <input
            id="employeeName"
            type="text"
            value={formData.employeeName}
            onChange={(e) => handleChange("employeeName", e.target.value)}
            className={fieldErrors.employeeName ? "input-error" : ""}
            aria-invalid={Boolean(fieldErrors.employeeName)}
            aria-describedby={fieldErrors.employeeName ? "employeeName-error" : undefined}
            disabled={isSubmitting}
          />
          {fieldErrors.employeeName && (
            <p className="field-error" id="employeeName-error">
              {fieldErrors.employeeName}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={(e) => handleChange("employeeId", e.target.value)}
            className={fieldErrors.employeeId ? "input-error" : ""}
            aria-invalid={Boolean(fieldErrors.employeeId)}
            aria-describedby={fieldErrors.employeeId ? "employeeId-error" : undefined}
            disabled={isSubmitting}
          />
          {fieldErrors.employeeId && (
            <p className="field-error" id="employeeId-error">
              {fieldErrors.employeeId}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="department">Department</label>
          <input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) => handleChange("department", e.target.value)}
            className={fieldErrors.department ? "input-error" : ""}
            aria-invalid={Boolean(fieldErrors.department)}
            aria-describedby={fieldErrors.department ? "department-error" : undefined}
            disabled={isSubmitting}
          />
          {fieldErrors.department && (
            <p className="field-error" id="department-error">
              {fieldErrors.department}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="testScore">Test Score (0–100)</label>
          <input
            id="testScore"
            type="number"
            min="0"
            max="100"
            value={formData.testScore}
            onChange={(e) => handleChange("testScore", e.target.value)}
            className={fieldErrors.testScore ? "input-error" : ""}
            aria-invalid={Boolean(fieldErrors.testScore)}
            aria-describedby={fieldErrors.testScore ? "testScore-error" : undefined}
            disabled={isSubmitting}
          />
          {fieldErrors.testScore && (
            <p className="field-error" id="testScore-error">
              {fieldErrors.testScore}
            </p>
          )}
        </div>

        <div className="form-field form-field-wide">
          <label htmlFor="remarks">Remarks (optional)</label>
          <textarea
            id="remarks"
            rows="2"
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {submitError && (
        <p className="field-error form-error" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting}
        aria-label="Create Supertest record"
      >
        {isSubmitting ? "Saving..." : "Create Record"}
      </button>
    </form>
  );
}

export default RecordForm;
