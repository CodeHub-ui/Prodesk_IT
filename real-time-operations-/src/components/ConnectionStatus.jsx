import { CONNECTION_STATE } from '../hooks/useWebSocket';
const STATUS_CONFIG = {
  [CONNECTION_STATE.CONNECTED]: { label: 'Connected', modifier: 'connected' },
  [CONNECTION_STATE.CONNECTING]: { label: 'Connecting', modifier: 'connecting' },
  [CONNECTION_STATE.RECONNECTING]: { label: 'Reconnecting', modifier: 'reconnecting' },
  [CONNECTION_STATE.DISCONNECTED]: { label: 'Disconnected', modifier: 'disconnected' },
};
function ConnectionStatus({ state }) {
  const { label, modifier } = STATUS_CONFIG[state] ?? STATUS_CONFIG[CONNECTION_STATE.DISCONNECTED];
  return (
    <div className="connection-status" role="status" aria-live="polite">
      <span className={`connection-status__dot connection-status__dot--${modifier}`} aria-hidden="true" />
      <span className="connection-status__label">{label}</span>
    </div>
  );
}
export default ConnectionStatus;