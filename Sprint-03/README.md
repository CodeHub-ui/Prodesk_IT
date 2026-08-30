# API Infrastructure Pipeline
 
**Prodesk IT · Week 3 · Sprint 03**
 
🔗 **Live Demo:** [https://sprint-03-api-infrastructure-pipeline.netlify.app/](https://sprint-03-api-infrastructure-pipeline.netlify.app/)
 
## 1. Sprint Objective
 
Sprint 03 validates the ability to work inside a distributed, asynchronous
front-end architecture. The dashboard fetches data from a remote service
through a timeout-guarded network layer, keeps the UI responsive with
skeleton loading states, and offloads CPU-intensive data processing to a
dedicated Web Worker so the main thread never blocks.
 
The project is a static site: three vanilla-JS modules, one stylesheet, one
Worker file, no build step, no framework.
 
## 2. Features
 
- Fetch-based API layer with a reusable, timeout-aware `fetch` wrapper
- Hard 5000ms timeout enforced with `AbortController`, with proper timer cleanup
- CSS skeleton loaders shaped like the final layout (KPI cards, panel copy, table rows)
- Dedicated `Service Unavailable` and `Request Timed Out` states, each with Retry
- A Web Worker that expands a small real payload into 10,000–50,000 synthetic
  records and filters, sorts, and aggregates statistics on them — off the main thread
- A live "pipeline" stage tracker (Fetch → Timeout Guard → Dataset Expansion →
  Worker Compute → Render) that visualizes exactly where the request currently is
- A demo/test control strip to trigger each mandatory pathway on demand
## 3. Architecture
 
```text
index.html            Markup + ARIA structure + script loading order
css/style.css          All visual states: skeletons, pills, table, panels
js/api.js              Network layer only — fetch, AbortController, error taxonomy
js/worker.js           Runs on a separate thread — expand / filter / sort / aggregate
js/ui.js               DOM rendering only — no fetch calls, no Worker references
js/app.js              Orchestration — owns state, wires api.js + worker.js + ui.js
```
 
Each file has exactly one job:
 
| File       | Owns                                   | Never does                        |
|------------|-----------------------------------------|------------------------------------|
| `api.js`   | `fetch`, `AbortController`, HTTP/parse/network/timeout errors | touch the DOM |
| `worker.js`| dataset expansion, filtering, sorting, statistics | touch the DOM (runs on its own thread; it *can't*) |
| `ui.js`    | every `innerHTML` write, every state render | call `fetch` or `new Worker(...)` |
| `app.js`   | app state, event wiring, deciding *when* things happen | build HTML strings |
 
Swapping `jsonplaceholder.typicode.com` for a real enterprise microservice
means changing exactly one constant (`ENDPOINT_URL` in `js/api.js`) — no
other file needs to know the endpoint changed.
 
## 4. Folder Structure
 
```text
sprint-03-api-infrastructure/
│
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── api.js
    ├── ui.js
    └── worker.js
```
 
## 5. API Used
 
`GET https://jsonplaceholder.typicode.com/users` — a free public mock REST
endpoint that returns 10 realistic user records (`id`, `name`, `username`,
`email`, `company`, etc.), well suited to frontend testing without needing
an API key.
 
## 6. Phase 1 Implementation — Asynchronous Integration
 
- `js/api.js` exposes `fetchUsers()`, an `async` function built entirely on
  `fetch()` + `await` (no `.then()` chains).
- All request logic is isolated from the UI: `app.js` and `ui.js` never call
  `fetch` directly, only `window.ApiLayer.fetchUsers()`.
- Every failure path is wrapped in `try/catch` and normalized into a single
  `ApiError` class with a `type` field: `"http"`, `"network"`, `"timeout"`,
  or `"parse"` — so `ui.js` can render a specific, correct state instead of
  guessing from an error string.
- On any failure, the UI renders a **Service Unavailable** panel (or the
  dedicated timeout panel — see Phase 2) instead of going blank, with a
  **Retry** button that re-runs the exact same request function without a
  page refresh.
## 7. Phase 2 Implementation — Latency Mitigation & Skeleton Loaders
 
**Skeletons:** `UI.showApiSkeleton()` and `UI.showTableSkeleton()` render
CSS-animated placeholder blocks (`.skeleton-line`, `.skeleton-table-row`)
the instant a request starts — never a blank panel, never a bare spinner.
They're replaced the moment a success, error, or timeout state is rendered.
 
**Timeout enforcement:** `timeoutAwareFetch()` in `js/api.js` creates an
`AbortController`, starts a `setTimeout(..., 5000)`, and passes
`controller.signal` into `fetch()`. If the timer fires first, `.abort()` is
called, `fetch` rejects with `AbortError`, and that's translated into an
`ApiError` of type `"timeout"`. The timer is always cleared in a `finally`
block, so a fast successful request never leaves a stray timer running.
 
```text
request -> AbortController created -> 5000ms timer starts -> fetch()
   -> response received OR timer fires first -> clearTimeout() -> resolve/reject
```
 
The timeout UI reads exactly:
 
> **Request Timed Out**
> Unable to receive a response within 5 seconds.
 
with its own **Retry** button.
 
## 8. Phase 3 Implementation — Web Workers & Non-Blocking Processing
 
`js/app.js` creates a real `new Worker('js/worker.js')` and sends it the
small (10-record) payload from the API along with a target expansion count.
The Worker — running on its own thread — does all of the following, none of
which ever touches the main thread while it happens:
 
1. **Expand** the 10 real records into 10,000–50,000 synthetic records
   (`expandDataset`)
2. **Filter** out ~4% of records simulating incomplete data (`filterRecords`)
3. **Sort** the remainder by a computed risk score, descending (`sortRecords`)
4. **Aggregate** statistics: totals, active/flagged counts, unique companies,
   top company, and processing duration via `performance.now()`
   (`computeStatistics`)
The main thread's job during this entire window is limited to: starting the
Worker, listening for its messages, and updating the DOM when a message
arrives — it performs none of the filtering/sorting/aggregation itself.
 
### 8.1 Worker Communication Protocol (documented in `js/worker.js`)
 
**Main thread → Worker**
```js
{
  type: "PROCESS_DATA",
  payload: {
    records: [ /* small real API payload */ ],
    targetCount: 25000
  }
}
```
 
**Worker → Main thread**, zero or more progress updates:
```js
{ type: "PROCESS_PROGRESS", payload: { stage: "expanding", percent: 45 } }
```
 
**Worker → Main thread**, terminal success:
```js
{
  type: "PROCESS_SUCCESS",
  payload: {
    records: [ /* top 60 rows, ready for the table */ ],
    statistics: {
      totalGenerated: 25000,
      totalAfterFilter: 23975,
      activeCount: 19500,
      flaggedCount: 4475,
      uniqueCompanies: 10,
      topCompany: "Deckow-Crist",
      durationMs: 41.2
    }
  }
}
```
 
**Worker → Main thread**, terminal failure:
```js
{ type: "PROCESS_ERROR", error: "No source records were provided..." }
```
 
`app.js` also handles a message of an unrecognized `type` and a native
`worker.onerror` crash — both resolve to a visible error state rather than a
silently stuck "Processing" label.
 
## 9. Timeout Implementation Summary
 
See §7 above — implemented with `AbortController` in `js/api.js`, exactly
5000ms, cleaned up in a `finally` block, with a dedicated UI state and Retry.
 
## 10. Error Handling Summary
 
| Case                     | Detected in | Resulting UI state                     |
|---------------------------|-------------|-----------------------------------------|
| Successful request         | `api.js`    | Data flows into the pipeline            |
| HTTP 4xx/5xx                | `api.js`    | "Service Unavailable" + Retry           |
| Network failure (offline, DNS, CORS) | `api.js` | "Service Unavailable" + Retry     |
| Timeout (>5000ms)            | `api.js`    | "Request Timed Out" + Retry             |
| Invalid/unparseable JSON     | `api.js`    | "Service Unavailable" (type: parse)     |
| Worker processing error       | `worker.js` → `app.js` | Worker panel error card    |
| Unexpected Worker message      | `app.js`   | Worker panel error card                |
 
The UI never remains stuck in a loading state — every async path in
`app.js` resolves to a rendered terminal state.
 
## 11. How to Run Locally
 
No build step, no `npm install`. Any static file server works because the
app uses `fetch` and a `Worker`, both of which require an HTTP(S) origin
(not `file://`).
 
```bash
cd sprint-03-api-infrastructure
python3 -m http.server 8080
# then open http://localhost:8080 in a browser
```
 
Or with Node's `http-server` / VS Code's "Live Server" extension — any
static server on the folder works identically.
 
## 12. How to Test API Failure
 
Click **Simulate API Error** in the "Pipeline Test Controls" strip at the
bottom of the dashboard. This does not call the real API — it exercises the
same `ApiError` → UI path a genuine 5xx response would take, so the
**Service Unavailable** state and its Retry button can be verified without
depending on the public API actually failing.
 
## 13. How to Test Timeout
 
Click **Simulate Timeout**. This genuinely waits past the 5000ms ceiling
before rejecting (it does not fake an instant timeout), producing the exact
**Request Timed Out** state a slow real endpoint would trigger. To see a
*real* timeout, you can also temporarily lower `TIMEOUT_MS` in `js/api.js`
to something like `1` and click **Load API Data**.
 
## 14. How to Test Worker Processing
 
Click **Load API Data** — the Worker runs automatically afterward on 25,000
synthetic records. To push it further, click **Process Large Dataset** to
re-run the Worker against 50,000 records using the same real payload. Watch
the "Web Worker Processing" panel's status pill move `Idle → Processing →
Completed`, the progress bar, and the KPI cards for records processed and
processing time. The pipeline strip at the top highlights each stage
(`Worker Compute`) as it becomes active.
 
## 15. Deployment Instructions
 
This is a fully static site with no server-side code and no build step.
 
**Live deployment:** the project is currently deployed on Netlify at
[https://sprint-03-api-infrastructure-pipeline.netlify.app/](https://sprint-03-api-infrastructure-pipeline.netlify.app/)
 
To deploy it yourself (or redeploy after changes):
 
1. Upload the contents of `sprint-03-api-infrastructure/` to any static host
   (GitHub Pages, Netlify, Vercel, S3 + CloudFront, etc.).
2. Ensure `index.html` is served from the root of the deployment (or adjust
   nothing — all internal paths are relative: `css/style.css`, `js/app.js`,
   `js/worker.js`, etc., so the folder can be deployed as-is at any path).
3. No environment variables, API keys, or CORS workarounds are required —
   the JSONPlaceholder API already allows cross-origin requests from any
   origin.
## 16. Browser Requirements
 
Requires a browser with support for: `fetch`, `AbortController`, `Worker`,
`async`/`await`, `Promise`, and `performance.now()` — i.e., any current
version of Chrome, Firefox, Safari, or Edge. No polyfills are included or
required.

 




