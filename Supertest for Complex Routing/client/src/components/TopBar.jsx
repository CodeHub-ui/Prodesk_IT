function TopBar({ searchTerm, onSearchChange }) {
  return (
    <header className="top-bar">
      <h1 className="top-bar-title">Digital Supertest</h1>

      <div className="search-wrapper">
        <label htmlFor="search-input" className="visually-hidden">
          Search records
        </label>
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Search by name, ID, or department..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search records"
        />
      </div>
    </header>
  );
}

export default TopBar;
