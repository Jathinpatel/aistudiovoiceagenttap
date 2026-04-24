# BFHL Node Hierarchy Assignment

This project contains a Node.js + Express backend and a simple frontend visualizer for the BFHL node hierarchy assignment.

## Files

- `index.js` - Express backend with the `POST /bfhl` API
- `frontend.html` - optional frontend to test and demonstrate the API
- `package.json` - project metadata and scripts

## Setup

1. Install Node.js.
2. Install dependencies:

```bash
npm install
```

3. Set your submission details in `.env` if needed. If `.env` is missing, the app falls back to `.env.example`:

```bash
USER_ID=JathinPatel_07112005
EMAIL_ID=js0273@srmist.edu.in
COLLEGE_ROLL_NUMBER=RA2311003050426
```

4. Start the server:

```bash
npm start
```

The app runs on `http://127.0.0.1:3000` by default.

## API

### `POST /bfhl`

Request body:

```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

Response includes:

- `user_id`
- `email_id`
- `college_roll_number`
- `hierarchies`
- `invalid_entries`
- `duplicate_edges`
- `summary`

Hierarchy objects follow the assignment format:

- non-cyclic groups return `root`, `tree`, and `depth`
- cyclic groups return `root`, `tree: {}`, and `has_cycle: true`
- `largest_tree_root` is chosen by greatest depth, then lexicographically smaller root

## Frontend

Start the server and open `http://127.0.0.1:3000` in your browser. The frontend is served by the Express app and can be used to demonstrate:

- tree generation
- cycle detection
- invalid input handling
- duplicate edge handling

## Notes

- Only edges in the format `X->Y` are treated as valid.
- Self loops such as `A->A` are treated as invalid entries.
- If a child appears under multiple parents, the first valid parent is kept.
- `largest_tree_root` is chosen by greatest depth, then lexicographically smaller root.

## Before Submission

- Set deployment environment variables if you need to override the values from `.env.example`.
- Run the project once locally after installing Node.js.
- For submission, deploy the app and share the hosted API base URL, hosted frontend URL, and public GitHub repository URL.

## Deployment

This app serves both the frontend and the API from the same Express service:

- frontend URL: your deployed base URL, such as `https://your-app.onrender.com`
- API base URL: the same deployed base URL
- BFHL endpoint: `https://your-app.onrender.com/bfhl`

### Render

The repo includes:

- `render.yaml` for a Render web service
- `.node-version` to pin the Node runtime

Recommended steps:

1. Push this folder to a public GitHub repository.
2. In Render, create a new Blueprint deployment from that repository.
3. Render will use `npm install`, `npm start`, and `/health`.
4. After deploy, open the base URL and test `POST /bfhl`.

### Submission URLs

You can usually submit:

- hosted API base URL: the deployed base URL
- hosted frontend URL: the same deployed base URL
- public GitHub repository URL
