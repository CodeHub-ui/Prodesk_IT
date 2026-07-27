# Real-Time Operations Workflow

A React-based real-time verification dashboard that simulates an operations room where field operators can review, approve, and reject verification tasks. The application uses WebSockets to receive live updates and automatically reflects task status changes without requiring a page refresh.

## Reference

**Ticket:** ENG-149206

---

## Features

- Real-time WebSocket connection
- Kanban-style workflow (Pending, In Progress, Completed)
- Approve and Reject task actions
- Automatic task updates through WebSocket messages
- Connection status indicator
- Automatic reconnection using exponential backoff
- Loading state while connecting
- Empty state when all tasks are completed
- Responsive layout
- Accessible UI using semantic HTML and ARIA attributes
- Analytics log for processed WebSocket events

---

## Tech Stack

- React 18
- Vite
- WebSockets
- Vanilla CSS
- JavaScript (ES6)

---

## Project Structure

```text
realtimeoperations/
├── src/
│   ├── components/
│   │   ├── WorkflowEngine.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── TaskCard.jsx
│   │   ├── ConnectionStatus.jsx
│   │   ├── Loader.jsx
│   │   └── EmptyState.jsx
│   │
│   ├── hooks/
│   │   └── useWebSocket.js
│   │
│   ├── utils/
│   │   └── reconnect.js
│   │
│   ├── styles/
│   │   └── workflow.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── vite.config.js
└── README.md
```

---

## WebSocket

The application connects to the public WebSocket endpoint:

```text
wss://echo.websocket.events
```

Incoming messages are parsed and used to update the React state instantly.

If the connection is lost, the application automatically reconnects using exponential backoff.

Reconnect sequence:

```text
1s → 2s → 4s → 8s → 16s
```

---

## Workflow

1. Dashboard loads.
2. WebSocket connection is established.
3. Pending verification tasks are displayed.
4. Clicking **Approve** or **Reject** sends a JSON payload.
5. Incoming WebSocket messages update the task status.
6. The task automatically moves to the appropriate column.
7. No page refresh is required.

---

## Acceptance Criteria

- Dashboard connects to a persistent WebSocket endpoint.
- Pending verification tasks are displayed.
- Approve and Reject actions send JSON messages through WebSocket.
- Incoming WebSocket events instantly update the UI.
- Automatic reconnection after connection loss.
- Loading indicator during initial connection.
- Empty state when all tasks are completed.

---

## Accessibility

- Semantic HTML elements
- ARIA labels
- Keyboard accessible controls
- Visible focus indicators

---

## Notes

The project uses **echo.websocket.events**, which is a public echo server. Messages are echoed back to the same client instead of being broadcast to multiple users. Replacing it with a broadcast-enabled WebSocket server would enable real-time synchronization across multiple clients without changing the application architecture.

---

## Screenshot

_Add a screenshot of the dashboard here._

---

## Author

Harshit Gupta