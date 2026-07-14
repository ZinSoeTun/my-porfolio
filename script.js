document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const projectGrid = document.getElementById('project-grid');
  const projectFilters = document.getElementById('project-filters');
  const projectSearch = document.getElementById('project-search');
  const projectRefresh = document.getElementById('project-refresh');
  const projectPagination = document.getElementById('project-pagination');
  const projectSummary = document.getElementById('project-summary');
  const repoCountValue = document.getElementById('repo-count-value');
  const skillsGrid = document.getElementById('skills-grid');
  const socialGrid = document.getElementById('social-grid');
  const commandInput = document.getElementById('command-input');
  const commandOutput = document.getElementById('output');
  const commandShortcuts = document.getElementById('command-shortcuts');

  const GITHUB_USERNAME = 'ZinSoeTun';
  const GITHUB_API_BASE = 'https://api.github.com';
  const README_PREVIEW_LIMIT = 960;
  const PROJECTS_PER_PAGE = 6;
  const REPOSITORY_CACHE_KEY = 'portfolio-github-repositories-v1';
  const README_CACHE_KEY = 'portfolio-github-readmes-v1';
  const REPOSITORY_CACHE_META_KEY = 'portfolio-github-repositories-meta-v1';
  const REPOSITORY_CACHE_TTL_MS = 1000 * 60 * 30;

  const skills = [
    {
      title: 'Backend Delivery',
      description: 'Laravel, PHP, authentication flows, routing, and maintainable business logic.',
      level: 'Advanced'
    },
    {
      title: 'Frontend Engineering',
      description: 'Responsive interfaces, elegant layouts, JavaScript interactions, and scalable UI systems.',
      level: 'Advanced'
    },
    {
      title: 'API and Data',
      description: 'SQL, MySQL, MongoDB, integrations, and dependable application data flow.',
      level: 'Strong'
    },
    {
      title: 'Modern JavaScript',
      description: 'JavaScript, React, Node.js, and practical client-side implementation for production work.',
      level: 'Strong'
    },
    {
      title: 'Problem Solving',
      description: 'Structured debugging, iterative improvement, and user-focused technical decisions.',
      level: 'Reliable'
    },
    {
      title: 'Professional Delivery',
      description: 'Clear communication, focused execution, and consistent attention to delivery quality.',
      level: 'Consistent'
    }
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=100082567453654&mibextid=ZbWKwL',
      label: 'Community and updates'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/zinsoetun123?igsh=MXJtcHE0MW5kbmU4dw==',
      label: 'Visual highlights'
    },
    {
      name: 'X',
      href: 'https://x.com/tunzinsoe?s=09',
      label: 'Short-form thoughts'
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@james.justin20?_t=8orPXc2PDAT&_r=1',
      label: 'Video snippets'
    },
    {
      name: 'Viber',
      href: 'https://vb.me/letsChatOnViber',
      label: 'Direct messaging'
    },
    {
      name: 'Telegram',
      href: 'https://t.me/Fly02345',
      label: 'Instant contact'
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@zinsoetun5485',
      label: 'Demonstrations and walkthroughs'
    }
  ];

  const readmeCache = new Map();
  let repositories = [];
  let repositoryLookup = new Map();
  let filterOrder = ['All'];
  let activeFilter = 'All';
  let currentPage = 1;
  let isLoadingRepositories = false;

  const commandResponses = {
    help: () => `
      <p><strong>Available commands</strong></p>
      <ul>
        <li><code>about</code> - Read a concise professional introduction.</li>
        <li><code>skills</code> - Review the main technical capabilities.</li>
        <li><code>projects</code> - Jump to the live GitHub portfolio feed.</li>
        <li><code>refresh</code> - Reload repositories from GitHub.</li>
        <li><code>contact</code> - View contact details and social links.</li>
        <li><code>theme</code> - Switch between dark mode and light mode.</li>
        <li><code>clear</code> - Reset this command panel.</li>
      </ul>
    `,
    about: () => `
      <p><strong>Professional introduction</strong></p>
      <p>
        I am a web developer with practical project experience across Laravel, PHP, and JavaScript delivery.
        My focus is on dependable implementation, polished user experience, and maintainable systems that scale cleanly.
      </p>
    `,
    skills: () => `
      <p><strong>Core strengths</strong></p>
      <ul>
        <li>Laravel and PHP application development for real project delivery</li>
        <li>Responsive front-end implementation with HTML, CSS, Bootstrap, and JavaScript</li>
        <li>Database integration with SQL, MySQL, and MongoDB</li>
        <li>React, Node.js, and Express for modern JavaScript workflows</li>
      </ul>
    `,
    projects: () => {
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
      projectSearch.focus();
      return `
        <p><strong>GitHub portfolio ready</strong></p>
        <p>
          This section is powered by the live GitHub repository feed. Use search, filters, and Details to inspect README previews.
        </p>
      `;
    },
    refresh: async () => {
      const result = await fetchRepositories();
      if (result.ok) {
        return `
          <p><strong>Repository feed refreshed</strong></p>
          <p>${escapeHtml(String(result.count))} public repositories were loaded from GitHub.</p>
        `;
      }

      if (result.cached) {
        return `
          <p><strong>Cached repository feed active</strong></p>
          <p>The live GitHub refresh was unavailable, so the most recent cached repositories are being shown instead.</p>
        `;
      }

      return `
        <p><strong>Refresh failed</strong></p>
        <p>GitHub data could not be loaded right now. Please try again in a moment.</p>
      `;
    },
    contact: () => `
      <p><strong>Contact details</strong></p>
      <p>Email: <a href="mailto:tunzinsoe786@gmail.com">tunzinsoe786@gmail.com</a></p>
      <p>Phone: <a href="tel:+9509988911436">+95 09 988 911 436</a></p>
      <p>Social platforms remain available in the contact card for direct follow-up.</p>
    `,
    theme: () => {
      const nextTheme = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return `<p><strong>Theme updated</strong></p><p>${nextTheme === 'dark' ? 'Dark mode is now active.' : 'Light mode is now active.'}</p>`;
    },
    clear: () => ''
  };

  function escapeHtml(value = '') {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }

  function detectInitialTheme() {
    const storedTheme = localStorage.getItem('portfolio-theme');

    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function formatRepositoryName(name = '') {
    return name
      .split(/[-_]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function formatUpdatedAt(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently updated';
    }

    return `Updated ${new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)}`;
  }

  function formatSyncTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  function normalizeHomepageUrl(value = '') {
    if (!value) {
      return '';
    }

    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }

  function getRepositoryCategory(repo) {
    return repo.language || repo.topics?.[0] || 'Repository';
  }

  function getRepositoryTags(repo) {
    return [...new Set([repo.language, ...(repo.topics || [])].filter(Boolean))].slice(0, 4);
  }

  function stripMarkdown(markdown = '') {
    return markdown
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/\|/g, ' ')
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function extractReadmePreview(markdown = '') {
    const stripped = stripMarkdown(markdown);

    if (!stripped) {
      return '';
    }

    const paragraphs = stripped
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    let preview = '';

    for (const paragraph of paragraphs) {
      const candidate = preview ? `${preview}\n\n${paragraph}` : paragraph;

      if (candidate.length > README_PREVIEW_LIMIT) {
        const remaining = Math.max(README_PREVIEW_LIMIT - preview.length - (preview ? 2 : 0), 0);
        const shortened = paragraph.slice(0, Math.max(remaining - 3, 0)).trim();
        preview = `${preview}${preview ? '\n\n' : ''}${shortened}...`;
        break;
      }

      preview = candidate;

      if (preview.length > README_PREVIEW_LIMIT * 0.85) {
        break;
      }
    }

    return preview || stripped.slice(0, README_PREVIEW_LIMIT).trim();
  }

  function renderReadmeHtml(text = '') {
    return text
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join('');
  }

  function setProjectSummary(message) {
    projectSummary.textContent = message;
  }

  function hydrateReadmeCache() {
    try {
      const cachedReadmes = JSON.parse(localStorage.getItem(README_CACHE_KEY) || '{}');

      Object.entries(cachedReadmes).forEach(([repositoryName, readmeState]) => {
        if (readmeState && typeof readmeState === 'object') {
          readmeCache.set(repositoryName, readmeState);
        }
      });
    } catch (error) {
      readmeCache.clear();
    }
  }

  function persistReadmeCache() {
    localStorage.setItem(README_CACHE_KEY, JSON.stringify(Object.fromEntries(readmeCache.entries())));
  }

  function setRepositoryCount(count) {
    repoCountValue.textContent = count > 0 ? String(count) : '--';
  }

  function setProjectRefreshState() {
    projectRefresh.disabled = isLoadingRepositories;
    projectRefresh.textContent = isLoadingRepositories ? 'Refreshing...' : 'Refresh Feed';
  }

  function resetToFirstPage() {
    currentPage = 1;
  }

  function renderSkills() {
    skillsGrid.innerHTML = skills
      .map(
        (skill, index) => `
          <article class="skill-item fade-in" style="animation-delay: ${index * 60}ms">
            <h3>${escapeHtml(skill.title)}</h3>
            <p>${escapeHtml(skill.description)}</p>
            <span class="skill-level">${escapeHtml(skill.level)}</span>
          </article>
        `
      )
      .join('');
  }

  function renderSocialLinks() {
    socialGrid.innerHTML = socialLinks
      .map(
        (link) => `
          <a class="social-link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(link.name)}</strong>
            <span>${escapeHtml(link.label)}</span>
          </a>
        `
      )
      .join('');
  }

  function renderFilters() {
    if (!repositories.length || isLoadingRepositories) {
      projectFilters.innerHTML = '';
      return;
    }

    projectFilters.innerHTML = filterOrder
      .map(
        (filter) => `
          <button
            class="filter-chip ${filter === activeFilter ? 'is-active' : ''}"
            type="button"
            data-filter="${escapeHtml(filter)}"
          >
            ${escapeHtml(filter)}
          </button>
        `
      )
      .join('');
  }

  function getVisibleRepositories() {
    const query = projectSearch.value.trim().toLowerCase();

    return repositories.filter((repository) => {
      const readmePreview = readmeCache.get(repository.name)?.text || '';
      const haystack = [
        repository.title,
        repository.name,
        repository.category,
        repository.summary,
        ...repository.tags,
        readmePreview
      ]
        .join(' ')
        .toLowerCase();

      const matchesFilter = activeFilter === 'All' || repository.category === activeFilter;
      const matchesQuery = query === '' || haystack.includes(query);
      return matchesFilter && matchesQuery;
    });
  }

  function getTotalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / PROJECTS_PER_PAGE));
  }

  function getPaginatedRepositories(visibleRepositories) {
    const totalPages = getTotalPages(visibleRepositories.length);
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    return {
      items: visibleRepositories.slice(startIndex, startIndex + PROJECTS_PER_PAGE),
      startIndex,
      totalPages
    };
  }

  function createProjectLinks(repository) {
    const links = [
      `<a class="project-link project-link--primary" href="${escapeHtml(repository.github)}" target="_blank" rel="noreferrer">Repository</a>`
    ];

    if (repository.homepage) {
      links.push(
        `<a class="project-link" href="${escapeHtml(repository.homepage)}" target="_blank" rel="noreferrer">Live Preview</a>`
      );
    }

    return links.join('');
  }

  function renderLoadingProjects() {
    projectPagination.hidden = true;
    projectGrid.innerHTML = Array.from({ length: PROJECTS_PER_PAGE }, (_, index) => {
      return `
        <article class="project-card project-card--loading fade-in" style="animation-delay: ${index * 40}ms">
          <div class="project-skeleton project-skeleton--pill"></div>
          <div class="project-skeleton project-skeleton--title"></div>
          <div class="project-skeleton project-skeleton--line"></div>
          <div class="project-skeleton project-skeleton--line short"></div>
          <div class="project-tags">
            <span class="project-skeleton project-skeleton--tag"></span>
            <span class="project-skeleton project-skeleton--tag"></span>
            <span class="project-skeleton project-skeleton--tag"></span>
          </div>
          <div class="project-links">
            <span class="project-skeleton project-skeleton--button"></span>
            <span class="project-skeleton project-skeleton--button"></span>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderProjects() {
    if (isLoadingRepositories) {
      renderLoadingProjects();
      return;
    }

    if (!repositories.length) {
      projectPagination.hidden = true;
      projectGrid.innerHTML = `
        <div class="project-empty">
          GitHub repositories are not available right now. Please use <strong>Refresh Feed</strong> to try again.
        </div>
      `;
      return;
    }

    const visibleRepositories = getVisibleRepositories();

    if (!visibleRepositories.length) {
      projectPagination.hidden = true;
      projectGrid.innerHTML = `
        <div class="project-empty">
          No repositories matched the current search or filter. Please try a different keyword.
        </div>
      `;
      return;
    }

    const { items: paginatedRepositories, startIndex, totalPages } = getPaginatedRepositories(visibleRepositories);

    projectGrid.innerHTML = paginatedRepositories
      .map(
        (repository, index) => `
          <article class="project-card fade-in" style="animation-delay: ${index * 45}ms">
            <div class="project-meta">
              <span class="meta-chip">${escapeHtml(repository.category)}</span>
              <span>${escapeHtml(formatUpdatedAt(repository.updatedAt))}</span>
            </div>
            <div>
              <h3>${escapeHtml(repository.title)}</h3>
              <p>${escapeHtml(repository.summary)}</p>
            </div>
            <div class="project-tags">
              ${repository.tags.map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="project-card-footer">
              <div class="project-links">
                ${createProjectLinks(repository)}
              </div>
              <button
                class="project-disclosure"
                type="button"
                data-readme-toggle="${escapeHtml(repository.name)}"
                aria-expanded="false"
                aria-controls="project-details-${repository.id}"
              >
                <span>Details</span>
                <span class="project-disclosure-arrow" aria-hidden="true"></span>
              </button>
            </div>
            <div class="project-details" id="project-details-${repository.id}" hidden></div>
          </article>
        `
      )
      .join('');

    renderPagination(visibleRepositories.length, startIndex, paginatedRepositories.length, totalPages);
  }

  function renderPagination(totalItems, startIndex, currentCount, totalPages) {
    if (totalItems <= PROJECTS_PER_PAGE) {
      projectPagination.hidden = true;
      projectPagination.innerHTML = '';
      return;
    }

    const endIndex = startIndex + currentCount;
    const pageButtons = Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      return `
        <button
          class="project-page-button project-page-button--number ${pageNumber === currentPage ? 'is-active' : ''}"
          type="button"
          data-page="${pageNumber}"
          aria-label="Go to page ${pageNumber}"
          ${pageNumber === currentPage ? 'aria-current="page"' : ''}
        >
          ${pageNumber}
        </button>
      `;
    }).join('');

    projectPagination.hidden = false;
    projectPagination.innerHTML = `
      <p class="project-pagination-summary">
        Showing ${startIndex + 1}-${endIndex} of ${totalItems} repositories
      </p>
      <div class="project-pagination-controls">
        <button
          class="project-page-button project-page-button--nav"
          type="button"
          data-page-nav="prev"
          ${currentPage === 1 ? 'disabled' : ''}
        >
          Previous
        </button>
        ${pageButtons}
        <button
          class="project-page-button project-page-button--nav"
          type="button"
          data-page-nav="next"
          ${currentPage === totalPages ? 'disabled' : ''}
        >
          Next
        </button>
      </div>
    `;
  }

  function mapRepository(repo) {
    const category = getRepositoryCategory(repo);
    const tags = getRepositoryTags(repo);

    return {
      id: repo.id,
      name: repo.name,
      title: formatRepositoryName(repo.name),
      category,
      tags: tags.length ? tags : ['Repository'],
      summary:
        repo.description?.trim() ||
        'A repository summary is not exposed here yet. Open Details to preview the README content.',
      github: repo.html_url,
      homepage: normalizeHomepageUrl(repo.homepage || ''),
      updatedAt: repo.updated_at
    };
  }

  function applyRepositoryState(nextRepositories) {
    repositories = nextRepositories;
    repositoryLookup = new Map(repositories.map((repository) => [repository.name, repository]));
    filterOrder = ['All', ...new Set(repositories.map((repository) => repository.category))];
    activeFilter = filterOrder.includes(activeFilter) ? activeFilter : 'All';
    currentPage = Math.min(currentPage, getTotalPages(repositories.length));
    setRepositoryCount(repositories.length);
  }

  function persistRepositoryCache() {
    localStorage.setItem(REPOSITORY_CACHE_KEY, JSON.stringify(repositories));
    localStorage.setItem(
      REPOSITORY_CACHE_META_KEY,
      JSON.stringify({
        syncedAt: new Date().toISOString()
      })
    );
  }

  function restoreRepositoryCache() {
    try {
      const cachedRepositories = JSON.parse(localStorage.getItem(REPOSITORY_CACHE_KEY) || '[]');

      if (!Array.isArray(cachedRepositories) || !cachedRepositories.length) {
        return false;
      }

      applyRepositoryState(cachedRepositories);
      return true;
    } catch (error) {
      return false;
    }
  }

  function getRepositoryCacheMeta() {
    try {
      const meta = JSON.parse(localStorage.getItem(REPOSITORY_CACHE_META_KEY) || '{}');
      return meta && typeof meta === 'object' ? meta : {};
    } catch (error) {
      return {};
    }
  }

  function hasFreshRepositoryCache() {
    const { syncedAt } = getRepositoryCacheMeta();

    if (!syncedAt) {
      return false;
    }

    const age = Date.now() - new Date(syncedAt).getTime();
    return Number.isFinite(age) && age >= 0 && age < REPOSITORY_CACHE_TTL_MS;
  }

  async function fetchRepositories(options = {}) {
    const { force = false } = options;

    if (!force && repositories.length && hasFreshRepositoryCache()) {
      const { syncedAt } = getRepositoryCacheMeta();
      setProjectSummary(
        `Showing the most recent cached GitHub repository feed${syncedAt ? ` from ${formatSyncTime(syncedAt)}` : ''}.`
      );
      renderFilters();
      renderProjects();
      return { ok: true, count: repositories.length, cached: true };
    }

    isLoadingRepositories = true;
    setProjectSummary('Loading public repositories directly from GitHub...');
    setProjectRefreshState();
    renderFilters();
    renderProjects();

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
        {
          headers: {
            Accept: 'application/vnd.github+json'
          }
        }
      );

      if (!response.ok) {
        const resetAtValue = response.headers.get('x-ratelimit-reset');
        const resetAt = resetAtValue
          ? new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            }).format(new Date(Number(resetAtValue) * 1000))
          : '';
        const error = new Error(`Repository request failed with status ${response.status}`);
        error.status = response.status;
        error.responseHeaders = {
          remaining: response.headers.get('x-ratelimit-remaining'),
          resetAt
        };
        throw error;
      }

      const payload = await response.json();

      applyRepositoryState(
        payload
          .filter((repo) => !repo.fork && !repo.archived)
          .map(mapRepository)
          .sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt))
      );
      persistRepositoryCache();
      const syncedAtLabel = formatSyncTime(getRepositoryCacheMeta().syncedAt);
      setProjectSummary(
        `${repositories.length} public repositories are synced from GitHub${syncedAtLabel ? ` as of ${syncedAtLabel}` : ''}. Open Details to preview README content on demand.`
      );

      return { ok: true, count: repositories.length };
    } catch (error) {
      const restored = restoreRepositoryCache();
      const { syncedAt } = getRepositoryCacheMeta();
      const remaining = error?.responseHeaders?.remaining ?? null;
      const resetAt = error?.responseHeaders?.resetAt ?? '';
      const isRateLimited = error?.status === 403 && remaining === '0';

      if (restored) {
        setProjectSummary(
          isRateLimited
            ? `GitHub rate limit is temporarily reached${resetAt ? ` until about ${resetAt}` : ''}, so the most recent cached repository feed is being shown.`
            : `Live GitHub refresh is unavailable right now, so the most recent cached repository feed${syncedAt ? ` from ${formatSyncTime(syncedAt)}` : ''} is being shown.`
        );
        return { ok: false, cached: true, error };
      }

      repositories = [];
      repositoryLookup = new Map();
      filterOrder = ['All'];
      activeFilter = 'All';
      setRepositoryCount(0);
      setProjectSummary(
        isRateLimited
          ? `GitHub rate limit is temporarily reached${resetAt ? ` until about ${resetAt}` : ''}. Please try Refresh Feed later.`
          : 'GitHub repositories could not be loaded right now. Please use Refresh Feed and try again.'
      );
      return { ok: false, cached: false, error };
    } finally {
      isLoadingRepositories = false;
      setProjectRefreshState();
      renderFilters();
      renderProjects();
    }
  }

  async function fetchRepositoryReadme(repositoryName) {
    if (readmeCache.has(repositoryName)) {
      return readmeCache.get(repositoryName);
    }

    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repositoryName}/readme`, {
        headers: {
          Accept: 'application/vnd.github.raw+json'
        }
      });

      if (response.status === 404) {
        const emptyResult = { status: 'empty', text: '' };
        readmeCache.set(repositoryName, emptyResult);
        persistReadmeCache();
        return emptyResult;
      }

      if (!response.ok) {
        throw new Error(`README request failed with status ${response.status}`);
      }

      const markdown = await response.text();
      const preview = extractReadmePreview(markdown);
      const result = preview ? { status: 'loaded', text: preview } : { status: 'empty', text: '' };

      readmeCache.set(repositoryName, result);
      persistReadmeCache();
      return result;
    } catch (error) {
      const errorResult = { status: 'error', text: '' };
      readmeCache.set(repositoryName, errorResult);
      persistReadmeCache();
      return errorResult;
    }
  }

  function renderReadmeState(repository, readmeState) {
    if (readmeState.status === 'loaded') {
      return `
        <div class="project-readme">
          ${renderReadmeHtml(readmeState.text)}
          <a class="project-inline-link" href="${escapeHtml(repository.github)}#readme" target="_blank" rel="noreferrer">
            Open full README on GitHub
          </a>
        </div>
      `;
    }

    if (readmeState.status === 'empty') {
      return `
        <p class="project-detail-note">
          This repository does not expose README details yet. You can still open the full repository on GitHub.
        </p>
      `;
    }

    return `
      <p class="project-detail-note">
        README details could not be loaded right now. Please try again in a moment.
      </p>
    `;
  }

  async function handleReadmeToggle(button) {
    const repositoryName = button.dataset.readmeToggle;
    const repository = repositoryLookup.get(repositoryName);
    const panel = document.getElementById(button.getAttribute('aria-controls'));

    if (!repository || !panel) {
      return;
    }

    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      button.setAttribute('aria-expanded', 'false');
      button.classList.remove('is-open');
      panel.hidden = true;
      return;
    }

    button.setAttribute('aria-expanded', 'true');
    button.classList.add('is-open');
    panel.hidden = false;

    const cachedReadme = readmeCache.get(repositoryName);

    if (cachedReadme) {
      panel.innerHTML = renderReadmeState(repository, cachedReadme);
      return;
    }

    panel.innerHTML = '<p class="project-detail-note">Loading README details...</p>';
    const readmeState = await fetchRepositoryReadme(repositoryName);

    if (button.getAttribute('aria-expanded') === 'true') {
      panel.innerHTML = renderReadmeState(repository, readmeState);
    }
  }

  function setCommandOutput(content) {
    commandOutput.innerHTML = content;
  }

  async function runCommand(command) {
    const normalized = command.trim().toLowerCase();

    if (!normalized) {
      setCommandOutput(commandResponses.help());
      return;
    }

    if (normalized === 'clear') {
      setCommandOutput('');
      commandInput.value = '';
      return;
    }

    const responder = commandResponses[normalized];

    if (!responder) {
      setCommandOutput(`
        <p><strong>Command not recognized</strong></p>
        <p>Please type <code>help</code> to review the available commands.</p>
      `);
      commandInput.value = '';
      return;
    }

    const response = await responder();
    setCommandOutput(response);
    commandInput.value = '';
  }

  function renderCommandShortcuts() {
    const shortcuts = [
      {
        command: 'about',
        title: 'About',
        description: 'Read the professional overview.'
      },
      {
        command: 'skills',
        title: 'Skills',
        description: 'View technical strengths.'
      },
      {
        command: 'projects',
        title: 'Projects',
        description: 'Jump to the GitHub project feed.'
      },
      {
        command: 'refresh',
        title: 'Refresh',
        description: 'Reload repositories from GitHub.'
      }
    ];

    commandShortcuts.innerHTML = shortcuts
      .map(
        (shortcut) => `
          <button class="command-shortcut" type="button" data-command="${shortcut.command}">
            <strong>${escapeHtml(shortcut.title)}</strong>
            <small>${escapeHtml(shortcut.description)}</small>
          </button>
        `
      )
      .join('');
  }

  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  projectSearch.addEventListener('input', () => {
    resetToFirstPage();
    renderProjects();
  });

  projectRefresh.addEventListener('click', async () => {
    await fetchRepositories({ force: true });
  });

  projectFilters.addEventListener('click', (event) => {
    const target = event.target.closest('[data-filter]');

    if (!target) {
      return;
    }

    activeFilter = target.dataset.filter;
    resetToFirstPage();
    renderFilters();
    renderProjects();
  });

  projectPagination.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-page]');
    const navButton = event.target.closest('[data-page-nav]');

    if (pageButton) {
      currentPage = Number(pageButton.dataset.page) || 1;
      renderProjects();
      projectGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!navButton) {
      return;
    }

    currentPage += navButton.dataset.pageNav === 'next' ? 1 : -1;
    renderProjects();
    projectGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  projectGrid.addEventListener('click', async (event) => {
    const toggleButton = event.target.closest('[data-readme-toggle]');

    if (!toggleButton) {
      return;
    }

    await handleReadmeToggle(toggleButton);
  });

  commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      void runCommand(commandInput.value);
    }
  });

  commandShortcuts.addEventListener('click', (event) => {
    const shortcut = event.target.closest('[data-command]');

    if (!shortcut) {
      return;
    }

    const { command } = shortcut.dataset;
    commandInput.value = command;
    void runCommand(command);
  });

  applyTheme(detectInitialTheme());
  hydrateReadmeCache();
  renderSkills();
  renderSocialLinks();
  renderCommandShortcuts();
  setCommandOutput(commandResponses.help());
  const restoredCache = restoreRepositoryCache();
  if (restoredCache) {
    const { syncedAt } = getRepositoryCacheMeta();
    setProjectSummary(
      `Showing the most recent cached GitHub repository feed${syncedAt ? ` from ${formatSyncTime(syncedAt)}` : ''}.`
    );
    renderFilters();
    renderProjects();
  }
  if (!restoredCache || !hasFreshRepositoryCache()) {
    void fetchRepositories({ force: !restoredCache });
  }
});
