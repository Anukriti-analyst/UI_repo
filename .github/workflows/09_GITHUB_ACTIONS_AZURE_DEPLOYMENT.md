# GitHub Actions and Azure Web App Deployment

## What was added

`.github/workflows/ui-ci-cd.yml` provides:

- CI/CD only for merged pull requests targeting `develop`, `release/**`, or `main`, plus `release-*` tags for UAT.
- Locked dependency installation with `npm ci`.
- A standalone ESLint validation job with a retained lint report artifact.
- A SonarQube job that starts after lint and retains scanner output.
- A production Vite build job that starts after SonarQube and publishes the deployable artifact.
- SonarQube static analysis.
- Veracode Pipeline Scan security analysis.
- A seven-day deployable artifact containing `dist`, `package.json`, and `package-lock.json`.
- Concurrency cancellation so stale branch runs do not consume runners.
- Separate Dev, QA, UAT, and Prod deployment jobs with protected environments.
- Empty-by-default Azure Web App values supplied through GitHub Environment variables and secrets.

The quality gate order is explicit: `Lint -> SonarQube -> CI (build) -> Veracode -> deployment`. Each stage retains its output as a GitHub Actions artifact. Veracode scans the deployable artifact produced by CI. Dev, QA, UAT, and Prod deployment jobs require successful results from all three stages. UAT and Prod additionally pause on their protected environment approvals.

Deployment mapping is explicit:

| Ref | Deployment |
| --- | --- |
| Merged PR from `feature/**` into `develop` | Dev |
| Merged PR into `release/**` | QA |
| `release-*` tag | UAT |
| Merged PR into `main` | Prod |

The workflow uses `pull_request` with `types: [closed]` and checks `github.event.pull_request.merged == true`. It checks out the PR merge commit, not the source branch head. A `release-*` tag is the only non-PR trigger and is the explicit UAT promotion action after the release PR has been merged. There is no manual deployment input.

The stages use separate GitHub Actions runs because each stage intentionally uses a different ref. A QA run cannot have a literal `needs: deploy-dev` dependency on a job from an earlier feature-branch run. The promotion dependency is enforced operationally through protected environments, required reviewers, branch restrictions, release/tag controls, and the rule that QA is only created after Dev validation. UAT and Prod must similarly require approval of the preceding stage.

Mapped branch and tag pushes run their corresponding CD job automatically after CI. `workflow_dispatch` is available only for a deliberate rerun with `deploy: true` and the matching ref/stage.

## Azure Web App requirements

This project is a Vite SPA using `BrowserRouter`. Each Azure Web App must therefore be configured as a Node.js Linux Web App with:

- Node.js `22 LTS`.
- `SCM_DO_BUILD_DURING_DEPLOYMENT=true`, so the production `serve` dependency is installed.
- Startup command: `npx serve -s dist -l 8080`.
- HTTPS-only enabled and a health check endpoint or route agreed with the backend team.
- CORS on the API allowing the exact URL of each UI environment.
- Application settings for the environment's `VITE_API_BASE_URL` at build time. Vite variables are public browser values and must not contain secrets.

The deployment artifact contains the built `dist` directory plus `package.json` and `package-lock.json`. Because `serve -s` provides SPA fallback, direct navigation to routes such as `/submissions/new` works on App Service.

## GitHub Environment configuration

Create protected environments named `dev`, `qa`, `uat`, and `prod`. For each environment, add:

| Name | Type | Value |
| --- | --- | --- |
| `AZURE_WEBAPP_NAME` | Variable | Azure App Service name |
| `AZURE_WEBAPP_SLOT_NAME` | Variable | Deployment slot name, or leave empty for the production slot |
| `VITE_DEV_API_BASE_URL` | Repository variable | Dev API base URL |
| `VITE_QA_API_BASE_URL` | Repository variable | QA API base URL |
| `VITE_UAT_API_BASE_URL` | Repository variable | UAT API base URL |
| `VITE_PROD_API_BASE_URL` | Repository variable | Prod API base URL |
| `SONAR_HOST_URL` | Repository variable | SonarQube server URL |
| `SONAR_PROJECT_KEY` | Repository variable | SonarQube project key |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Secret | App Service publish profile XML |

Also add these repository or environment secrets:

| Name | Type | Value |
| --- | --- | --- |
| `SONAR_TOKEN` | Secret | SonarQube analysis token |
| `VERACODE_API_ID` | Secret | Veracode API ID |
| `VERACODE_API_KEY` | Secret | Veracode API key |

The workflow intentionally has empty fallbacks for the CD values. Do not commit publish profiles. For mature production usage, replace publish-profile authentication with Azure federated identity/OIDC and store only the Azure client, tenant, subscription, and resource identifiers as protected environment values.

Configure required reviewers for `uat` and `prod`, restrict who can deploy, and prevent untrusted pull requests from accessing environment secrets. CI does not reference a protected environment, so it runs immediately; the `deploy-uat` and `deploy-prod` jobs pause for environment approval before calling Azure.

SonarQube and Veracode jobs are always present in the workflow and are deployment dependencies. Until their credentials are configured, their scan steps emit a warning and skip. Veracode is non-blocking for Dev, QA, and UAT, but a failed or missing Veracode result blocks Prod. Configure Veracode credentials and the Prod protected environment before enabling production deployment.

## Environment readiness assessment

| Environment | Current status | Work still required |
| --- | --- | --- |
| Dev | Merged feature PR deployment configured, Azure values blank | Create the Web App, configure startup/build settings, set the dev API URL, and configure API CORS. |
| QA | Merged release PR deployment configured, Azure values blank | Create a separate App Service or slot, API endpoint, GitHub Environment, and approval policy. |
| UAT | Release tag deployment configured, Azure values blank | Create isolated UI/API resources, require business approval, and add smoke-test evidence before promotion. |
| Prod | Merged PR to main deployment configured, Azure values blank | Add a protected environment, approvals, deployment identity, slot strategy, monitoring, rollback plan, and a production API URL. |

The UI can be built for all four environments because `VITE_API_BASE_URL` is configurable. The repository currently does not contain four configured GitHub Environments, automated smoke tests, health checks, or Azure resource definitions, so deployment readiness depends on creating those external controls.

## Production operating practices

- Protect `main`; require CI, review, and up-to-date branches before merge.
- Promote the verified artifact for a given branch/tag through its mapped environment; do not deploy an unverified local build. For true artifact promotion across the different refs, add a release workflow that copies the approved artifact between protected environments.
- Use App Service deployment slots for prod and swap only after validation where the hosting plan supports slots.
- Add post-deployment smoke tests for `/`, `/login`, static assets, and a non-mutating API health check.
- Enable App Service logs, Application Insights, alerts, and deployment history.
- Pin third-party Actions to reviewed commit SHAs in the hardened production version of this workflow.
- Review `npm audit` findings separately from CI gating; the current dependency tree reports nine vulnerabilities (one moderate and eight high) and should be remediated before production approval.
- Keep build artifacts, source maps, and logs free of credentials and personal data.
- Add a documented rollback procedure: swap back to the previous slot or redeploy the previous artifact.
- Keep Node.js, npm, and action versions maintained through scheduled dependency updates.
