import TaskCard from './TaskCard';
function KanbanColumn({ title, tasks, isOffline, actionable = false, onApprove, onReject }) {
  const headingId = `column-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section className="kanban-column" aria-labelledby={headingId}>
      <header className="kanban-column__header">
        <h2 id={headingId}>{title}</h2>
        <span className="kanban-column__count" aria-label={`${tasks.length} task${tasks.length === 1 ? '' : 's'}`}>
          {tasks.length}
        </span>
      </header>
      {tasks.length === 0 ? (
        <p className="kanban-column__empty">No tasks in this column.</p>
      ) : (
        <ul className="kanban-column__list">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                isOffline={isOffline}
                showActions={actionable}
                onApprove={onApprove}
                onReject={onReject}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export default KanbanColumn;
