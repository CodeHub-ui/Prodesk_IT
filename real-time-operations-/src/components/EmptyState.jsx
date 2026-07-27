function EmptyState() {
  return (
    <section className="empty-state" aria-labelledby="empty-state-heading">
      <div className="empty-state__illustration" aria-hidden="true">
        <span className="empty-state__check" />
      </div>
      <h2 id="empty-state-heading" className="empty-state__title">
         All caught up!
      </h2>
      <p className="empty-state__subtitle">No pending verification tasks.</p>
    </section>
  );
}
export default EmptyState;