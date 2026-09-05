function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <span className="spinner-label">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
