import { useCallback, useMemo, useState } from 'react';
import { useWebSocket, CONNECTION_STATE } from '../hooks/useWebSocket';
import KanbanColumn from './KanbanColumn';
import ConnectionStatus from './ConnectionStatus';
import EmptyState from './EmptyState';
import Loader from './Loader';
const INITIAL_TASKS = [
  { id: 1, title: 'Verify Employee Documents', status: 'PENDING' },
  { id: 2, title: 'Validate Customer Identity', status: 'PENDING' },
  { id: 3, title: 'Cross Check Address', status: 'IN_PROGRESS' },
  { id: 4, title: 'Background Verification', status: 'COMPLETED' },
  { id: 5, title: 'KYC Verification', status: 'PENDING' },
  { id: 6, title: 'Document Review', status: 'IN_PROGRESS' },
];
const COMPLETED_STATUSES = ['APPROVED', 'REJECTED', 'COMPLETED'];
function WorkflowEngine() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const handleIncomingMessage = useCallback((message) => {
    if (!message || message.type !== 'STATUS_UPDATE') return;
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === message.taskId ? { ...task, status: message.newStatus } : task
      )
    );
    console.log('[Analytics] Task status mutated via WebSocket');
  }, []);
  const { connectionState, sendMessage } = useWebSocket(handleIncomingMessage);
  const isOffline = connectionState !== CONNECTION_STATE.CONNECTED;
  const updateTaskStatus = useCallback(
    (taskId, newStatus) => sendMessage({ type: 'STATUS_UPDATE', taskId, newStatus }),
    [sendMessage]
  );
  const pendingTasks = useMemo(() => tasks.filter((task) => task.status === 'PENDING'), [tasks]);
  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === 'IN_PROGRESS'),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((task) => COMPLETED_STATUSES.includes(task.status)),
    [tasks]
  );
  const hasActiveWork = pendingTasks.length > 0 || inProgressTasks.length > 0;
  return (
    <main className="workflow">
      {connectionState === CONNECTION_STATE.CONNECTING ? (
        <Loader />
      ) : (
        <>
          <header className="workflow__header">
            <div className="workflow__heading">
              <h1>Operations Room</h1>
              <p>Real-time verification workflow</p>
            </div>
            <ConnectionStatus state={connectionState} />
          </header>
          <section className="workflow__board" aria-label="Verification task board">
            {hasActiveWork ? (
              <>
                <KanbanColumn
                  title="Pending"
                  tasks={pendingTasks}
                  isOffline={isOffline}
                  actionable
                  onApprove={(id) => updateTaskStatus(id, 'APPROVED')}
                  onReject={(id) => updateTaskStatus(id, 'REJECTED')}
                />
                <KanbanColumn title="In Progress" tasks={inProgressTasks} isOffline={isOffline} />
              </>
            ) : (
              <EmptyState />
            )}
            <KanbanColumn title="Completed" tasks={completedTasks} isOffline={isOffline} />
          </section>
        </>
      )}
    </main>
  );
}
export default WorkflowEngine;
