import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import RecordForm from "../components/RecordForm.jsx";
import RecordTable from "../components/RecordTable.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyMessage from "../components/EmptyMessage.jsx";
import { fetchRecords } from "../services/supertestApi.js";
import "../styles/dashboard.css";
import "../styles/form.css";
import "../styles/table.css";

function Home() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecords() {
      setIsLoading(true);
      setLoadError("");
      try {
        const data = await fetchRecords();
        if (isMounted) {
          setRecords(data);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || "Failed to load records.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleRecordCreated(newRecord) {
    setRecords((prev) => [...prev, newRecord]);
  }
 
  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return records;
    }
    return records.filter((record) => {
      return (
        record.employeeName.toLowerCase().includes(term) ||
        record.employeeId.toLowerCase().includes(term) ||
        record.department.toLowerCase().includes(term)
      );
    });
  }, [records, searchTerm]);

  return (
    <div className="dashboard">
      <TopBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="dashboard-main">
        <RecordForm onRecordCreated={handleRecordCreated} />

        <section className="records-section" aria-label="Supertest records">
          {isLoading && <LoadingSpinner label="Loading records..." />}

          {!isLoading && loadError && (
            <p className="field-error form-error" role="alert">
              {loadError}
            </p>
          )}

          {!isLoading && !loadError && filteredRecords.length === 0 && (
            <EmptyMessage
              title="No Data Found"
              subtitle="Create your first Supertest record"
            />
          )}

          {!isLoading && !loadError && filteredRecords.length > 0 && (
            <RecordTable records={filteredRecords} />
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
