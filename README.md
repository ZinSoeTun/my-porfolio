# Zin Soe Tun Portfolio

A modern personal portfolio website built with HTML, CSS, and JavaScript. The site presents a polished developer profile, a responsive Bento-style interface, dark and light themes, and a live GitHub-powered project feed with README previews, caching, filtering, search, and pagination.

## Overview

This portfolio was redesigned to reflect a more experienced professional profile rather than an early-career showcase. Instead of relying on manually hard-coded project cards, the project section now loads public repositories from GitHub and turns them into interactive portfolio cards automatically.

## Highlights

- Modern minimalist interface with Bento grid styling
- Dark mode and light mode support
- Responsive layout for mobile, tablet, laptop, and desktop screens
- Live GitHub repository feed for public projects
- README preview toggle for repository details
- Client-side caching to reduce repeated GitHub API requests
- Search and category filtering for repositories
- Pagination with a configurable page size
- Command-center style quick actions for navigating the portfolio

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5 stylesheet
- GitHub REST API

## Key Functionality

### 1. GitHub-Driven Project Cards

The portfolio fetches public repositories from the configured GitHub account and converts them into project cards automatically. Each card includes:

- Project name
- Repository category or primary language
- Short summary
- Tags
- Repository link
- Optional live preview link
- Expandable README preview

### 2. README Detail Preview

Each repository card includes a `Details` toggle. When opened, the interface requests the repository README from GitHub, extracts a readable preview, and displays it inside the card.

### 3. Smart Caching

To reduce GitHub API usage and avoid unnecessary repeated requests:

- Repository data is cached in `localStorage`
- README previews are cached separately
- Cached repository data is reused for a fixed time window before refreshing
- If live refresh fails, the most recent cached feed is shown when available

### 4. Search, Filters, and Pagination

The project feed supports:

- Text search across repository title, tags, summary, and README preview
- Category filtering based on repository language or topic
- Pagination with a configurable page size

The current implementation is configured to show **6 repositories per page**.

## Configuration

Important constants are located in `script.js`.

```js
const GITHUB_USERNAME = 'ZinSoeTun';
const README_PREVIEW_LIMIT = 960;
const PROJECTS_PER_PAGE = 6;
const REPOSITORY_CACHE_TTL_MS = 1000 * 60 * 30;
```

You can update these values to customize:

- The GitHub account used for the project feed
- The README preview length
- The number of cards shown per page
- The cache duration

## Project Structure

```text
my-porfolio/
|-- avatar image.jpg
|-- index.html
|-- README.md
|-- script.js
`-- style.css
```

## Local Development

Because this is a static front-end project, no build step is required.

### Option 1: Open Directly

Open `index.html` in a browser.

### Option 2: Use a Local Server

Using a local server is recommended for testing browser behavior more reliably.

Examples:

- VS Code Live Server
- PHP built-in server
- Any lightweight local HTTP server

## Notes About GitHub API Usage

The project uses the public GitHub REST API from the browser. If you refresh too frequently, GitHub may temporarily limit requests for unauthenticated traffic. The portfolio includes caching and fallback behavior to reduce this issue, but for a more production-oriented setup you may later choose to move repository syncing to a server-side or build-time workflow.

## Design Direction

This version of the portfolio focuses on:

- Professional tone
- Clear project presentation
- Strong mobile responsiveness
- Modern typography
- Elegant visual hierarchy
- Reduced manual maintenance for project cards

## Author

**Zin Soe Tun**

- GitHub: [ZinSoeTun](https://github.com/ZinSoeTun)
- Email: [tunzinsoe786@gmail.com](mailto:tunzinsoe786@gmail.com)
