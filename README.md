# <img src="public/icons/icon_48.png" width="45" align="left">PR Triage per Effort

This extension allows users to change the view of GitHub Pull Requests list to show the ones needing the least effort to be merged. It requires the [PR Triage by Review Effort GitHub Action](https://github.com/marketplace/actions/pr-triage-by-review-effort) to be enabled for proper functionality. This extension is the result of an end-of-study project.

## Features

- Sort pull requests by review effort


## Installation

### Chrome Extension

1. Download the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/pr-triage-effort-extensio/apcidpfpcfkiekneknhfabibgkjhlban?authuser=2&hl=en&pli=1)
2. Click "Add to Chrome" to install the extension.
3. Follow the on-screen instructions to complete the installation.

## Permissions

To use this extension, you need to generate a GitHub token with the following permissions:
- `repo`: Full control of private repositories
- `read:org`: Read-only access to organization membership

These permissions are required to fetch and display pull request details and to ensure the extension functions correctly.

## Privacy Policy

You can read our privacy policy [here](doc/policy.md)

## GitHub Action

This extension works in conjunction with the [PR Triage by Review Effort GitHub Action](https://github.com/marketplace/actions/pr-triage-by-review-effort). Make sure to enable this action in your repository to utilize the full functionality of the extension.

## Contribution

In order to build the project, you need to have Node.js installed. Then, go in the project directory and run the following commands:

```bash
npm install
```
To compile the project, run:
```bash
npm run build
```
---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)
