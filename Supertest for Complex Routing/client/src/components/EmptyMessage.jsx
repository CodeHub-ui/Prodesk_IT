function EmptyMessage({
  title = "No Data Found",
  subtitle = "Create your first Supertest record",
}) {
  return (
    <div className="empty-message" role="status">
      <p className="empty-title">{title}</p>
      <p className="empty-subtitle">{subtitle}</p>
    </div>
  );
}

export default EmptyMessage;
