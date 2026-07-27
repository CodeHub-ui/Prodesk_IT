const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
};
function TaskCard({ task, isOffline, showActions, onApprove, onReject }) {
  const statusLabel = STATUS_LABELS[task.status] ?? task.status;
  const statusModifier = task.status.toLowerCase().replace(/_/g, '-');
  return (
    <article className="task-card">
      <h3 className="task-card__title">{task.title}</h3>
      <span className={`task-card__status task-card__status--${statusModifier}`}>{statusLabel}</span>
      {showActions && (
        <div
          className="task-card__actions"
          title={isOffline ? 'Offline - Reconnecting...' : undefined}
        >
          <button
            type="button"
            className="task-card__button task-card__button--approve"
            aria-label={`Approve ${task.title}`}
            disabled={isOffline}
            onClick={() => onApprove(task.id)}
          >
            Approve
          </button>
          <button
            type="button"
            className="task-card__button task-card__button--reject"
            aria-label={`Reject ${task.title}`}
            disabled={isOffline}
            onClick={() => onReject(task.id)}
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
export default TaskCard;
