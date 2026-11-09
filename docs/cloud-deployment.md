# Cloud development and deployment

Use Node.js 22. In a Codex cloud environment, run `npm ci` during setup.
Start the local reader with `npm start` (port 4175). For browser QA on Linux,
install Chromium with `npx playwright install --with-deps chromium` and set
`QA_BROWSER_CHANNEL=chromium` for the QA browser configuration.
Keep all story approvals and the main-thread-only rules in AGENTS.md.

`npm run build` writes the public website to `dist/`. Its only inputs are
`app/`, `platform/`, `stories/` and `vendor/`; documentation, agents, QA,
reference artwork and backups are not exposed by the deployed website.
Source and canonical references remain available in the Git repository.

GitHub Pages runs `.github/workflows/deploy.yml` after each push to `main`.
`BASE_PATH=/pixel-nook-studio/` scopes deployment URLs to the repository
subdirectory, including module imports, story manifests and asset URLs.
Local source URLs and the approved story art/staging are unchanged.

For Vercel, import this repository. The checked-in `vercel.json` runs
`npm run build` with the default root mount `/` and publishes `dist/`.
No secret or API key is needed to serve the reader.

Reading progress is browser-local: phone, desktop and localhost saves are
independent. Export remains entirely in the browser, subject to that browser's
video encoding support.
