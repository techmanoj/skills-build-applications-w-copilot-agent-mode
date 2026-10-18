# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use the shared API client and a reusable data-loading component for accessible loading, empty, success, and error states; keep each route's data rendering in its component.
- Logic tier decision: Keep validation and behavior in backend services, return deliberate 4xx responses for invalid input or unknown references, and leave route handlers focused on HTTP translation.
- Data tier decision: Add required Mongoose validation and defaults that reflect the API contract; preserve idempotent seed upserts and unrelated records.
- Activity tracking approach: Require existing user and team IDs, a non-empty activity type, and positive minutes; store the submitted references and compute points from minutes with the current time as `occurredAt`.
- Team management approach: Require a name and mascot, default members to an empty array, and validate any supplied member IDs before saving.
- Leaderboard approach: Sum activity points by team, include teams with no activity at zero, and assign ranks in descending point order.
- Workout suggestions approach: Find users by email, prefer workouts matching their fitness goal and otherwise use recent activity, explain the recommendation, and return a 4xx for unknown users.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — passed (5/5); failures indicate schema or seed-contract regressions.
- API: `npm run test:api --prefix octofit-tracker/backend` — passed (4/4); failures indicate request validation, persistence, ranking, or recommendation regressions.
- Frontend: `npm test --prefix octofit-tracker/frontend` — passed (15/15); failures indicate rendering or accessible loading, empty, and error-state regressions.
- Backend build: `npm run build --prefix octofit-tracker/backend` — passed; failures indicate TypeScript errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` — passed; failures indicate TypeScript or production-bundle errors.
