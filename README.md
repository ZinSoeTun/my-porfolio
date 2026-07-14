# Zin Soe Tun Portfolio

A modern personal portfolio website built with HTML, CSS, JavaScript, Bootstrap 5, and custom styling. The interface presents a polished full-stack developer profile through a responsive Bento-style layout, dark and light themes, and an auto-synced GitHub project feed designed for dependable public viewing on GitHub Pages.

## Overview

This portfolio was redesigned to reflect a more experienced professional profile rather than an early-career showcase. The project section no longer depends on manually maintained cards. Instead, public repositories are synchronized into a local JSON feed and rendered automatically as portfolio entries with searchable metadata and stored README highlights.

## Highlights

- Modern minimalist interface with Bento grid styling
- Dark mode and light mode support
- Responsive layout for mobile, tablet, laptop, desktop, and large-screen viewing
- Auto-synced GitHub repository feed for public projects
- Stored README detail previews for each repository card
- Search, filtering, and pagination for project discovery
- Configurable page size with the current feed set to **6 repositories per page**
- Command-center style quick actions for portfolio navigation
- GitHub Actions workflow for recurring feed synchronization

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5
- GitHub Actions
- GitHub REST API for build-time synchronization

## Key Functionality

### 1. Auto-Synced Project Cards

The portfolio reads project data from `data/projects.json`, which is generated from the configured GitHub account. Each card includes:

- Project name
- Repository category or primary language
- Short summary
- Tags
- Repository link
- Optional live preview link
- Expandable README detail preview

### 2. Stored README Detail Preview

Each repository card includes a `Details` toggle. When opened, the interface displays a stored preview derived from the repository README. This removes the need for each site visitor to call the GitHub API directly at runtime.

### 3. Public-Site Reliability

To prevent recurring GitHub rate-limit issues on the public site:

- Repository data is synchronized ahead of time into a static JSON file
- README highlights are stored in the same synced feed
- The browser reads same-origin portfolio data instead of live GitHub API responses
- Local cache is still used as a lightweight fallback if the latest synced file is temporarily unavailable

### 4. Search, Filters, and Pagination

The project feed supports:

- Text search across repository title, tags, summary, and README preview
- Category filtering based on repository language or topic
- Pagination with a configurable page size

## Configuration

Important front-end constants are located in `script.js`.

```js
const GITHUB_USERNAME = 'ZinSoeTun';
const PROJECT_FEED_PATH = './data/projects.json';
const PROJECTS_PER_PAGE = 6;
```

The synchronization script is located in `tools/sync-projects.mjs`.

You can update these values to customize:

- The GitHub account used for the project feed
- The data source path used by the portfolio
- The number of cards shown per page

## Project Structure

```text
my-porfolio/
|-- .github/
|   `-- workflows/
|       `-- sync-projects.yml
|-- data/
|   `-- projects.json
|-- tools/
|   `-- sync-projects.mjs
|-- avatar image.jpg
|-- index.html
|-- README.md
|-- script.js
`-- style.css
```

## Synchronization Flow

The repository feed is refreshed through `tools/sync-projects.mjs`.

This script:

- Collects public repositories from the configured GitHub account
- Extracts a readable README preview for each repository
- Writes the normalized portfolio dataset to `data/projects.json`

The included GitHub Actions workflow `.github/workflows/sync-projects.yml` is configured to:

- Run on manual dispatch
- Run on an hourly schedule
- Commit updated feed data back into the repository when changes are detected

## Local Development

Because this is a static front-end project, no bundler is required.

### Option 1: Open Directly

Open `index.html` in a browser.

### Option 2: Use a Local Server

Using a local server is recommended for more reliable testing.

Examples:

- VS Code Live Server
- PHP built-in server
- Any lightweight local HTTP server

### Refresh the Portfolio Feed Locally

To rebuild the synced project feed manually:

```bash
node tools/sync-projects.mjs
```

If unauthenticated GitHub API requests are rate-limited, the script can fall back to public GitHub HTML scraping locally. In GitHub Actions, the provided `GITHUB_TOKEN` gives the workflow a more reliable build-time synchronization path.

## Design Direction

This version of the portfolio focuses on:

- Professional tone
- Clear project presentation
- Strong responsive behavior across screen sizes
- Modern typography
- Elegant visual hierarchy
- Reduced manual maintenance for project cards
- Greater reliability for the public GitHub Pages experience

## Author

**Zin Soe Tun**

- GitHub: [ZinSoeTun](https://github.com/ZinSoeTun)
- Email: [tunzinsoe786@gmail.com](mailto:tunzinsoe786@gmail.com)
