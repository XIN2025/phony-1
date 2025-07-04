export const JEST_WORKFLOW = `
name: Run Tests

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Format Jest results as JSON
        run: |
          jq --arg root "$(pwd)" '{ 
            type: "jest", 
            projectName: "{{PROJECT_NAME}}",
            testResults: [ 
              .testResults[] | { 
                name: (.name | sub("^" + $root + "/"; "")), 
                tests: (.assertionResults | length), 
                passing: ([.assertionResults[] | select(.status == "passed")] | length), 
                failing: ([.assertionResults[] | select(.status == "failed")] | length), 
                skipped: ([.assertionResults[] | select(.status == "skipped")] | length) 
              } 
            ] 
          }' test-results.json > formatted-test-results.json

      - name: Send test results to API
        run: |
          curl -X POST "https://tools-backend.dev.opengig.work/integrations/testing-data" \\
            -H "Content-Type: application/json" \\
            -d @formatted-test-results.json
      - name: Send Coverage XML to API
        run: |
          sed 's/<?xml.*?>//' coverage/clover.xml | \\
          grep -v '<line ' | \\
          jq -Rs '{projectName: "{{PROJECT_NAME}}", content: .}' | \\
          curl -X POST "https://tools-backend.dev.opengig.work/integrations/testing-data/coverage" \\
            -H "Content-Type: application/json" \\
            --data-binary @-
`;

export const CYPRESS_WORKFLOW = `
name: Cypress Tests and Results Processing

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  cypress-run-and-process:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install

      - name: Install Cypress
        run: npx cypress install
      - name: Run Cypress tests
        run: |
          pnpm test:e2e
        continue-on-error: true

      - name: Check if results file exists
        run: |
          if [ ! -f cypressResult.json ]; then
            echo "Cypress results file not found"
            exit 1
          fi
      - name: Format Cypress results as JSON
        run: |
          jq '{
            type: "cypress",
            projectName: "{{PROJECT_NAME}}",
            testResults: [
              with_entries(select(.key != "totals")) | 
              to_entries[] | {
                name: .key,
                tests: (.value | length),
                passing: (.value | to_entries | map(select(.value == "passed")) | length),
                failing: (.value | to_entries | map(select(.value == "failed")) | length),
                skipped: (.value | to_entries | map(select(.value == "skipped")) | length),
                testcases: (.value | to_entries | map({
                  name: .key,
                  result: .value
                }))
              }
            ]
          }' cypressResult.json > formatted-test-results.json

      - name: Send test results to API
        run: |
          curl -X POST "https://tools-backend.dev.opengig.work/integrations/testing-data" \\
            -H "Content-Type: application/json" \\
            -d @formatted-test-results.json
`;
