function RecordTable({ records }) {
  return (
    <div className="table-wrapper">
      <table className="record-table">
        <caption className="visually-hidden">Supertest records</caption>
        <thead>
          <tr>
            <th scope="col">Employee Name</th>
            <th scope="col">Employee ID</th>
            <th scope="col">Department</th>
            <th scope="col">Test Score</th>
            <th scope="col">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td data-label="Employee Name">{record.employeeName}</td>
              <td data-label="Employee ID">{record.employeeId}</td>
              <td data-label="Department">{record.department}</td>
              <td data-label="Test Score">
                {record.testScore === null || record.testScore === undefined
                  ? "—"
                  : record.testScore}
              </td>
              <td data-label="Remarks">{record.remarks || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecordTable;
