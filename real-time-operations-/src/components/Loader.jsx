function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <p className="loader__text">Connecting to Operations Room...</p>
    </div>
  );
}
export default Loader;
