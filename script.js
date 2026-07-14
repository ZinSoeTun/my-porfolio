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
  const PROJECT_FEED_PATH = './data/projects.json';
  const PROJECTS_PER_PAGE = 6;
  const REPOSITORY_CACHE_KEY = 'portfolio-synced-repositories-v2';
  const REPOSITORY_CACHE_META_KEY = 'portfolio-synced-repositories-meta-v2';

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
        <li><code>projects</code> - Jump to the auto-synced GitHub portfolio feed.</li>
        <li><code>refresh</code> - Reload the latest synced repository feed.</li>
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
          This section is powered by an auto-synced GitHub repository feed. Use search, filters, and Details to inspect README highlights.
        </p>
      `;
    },
    refresh: async () => {
      const result = await fetchRepositories({ force: true });

      if (result.ok) {
        return `
          <p><strong>Repository feed refreshed</strong></p>
          <p>${escapeHtml(String(result.count))} public repositories were loaded from the synced portfolio feed.</p>
        `;
      }

      if (result.cached) {
        return `
          <p><strong>Cached portfolio feed active</strong></p>
          <p>The newest synced feed was unavailable, so the most recent cached project data is being shown instead.</p>
        `;
      }

      return `
        <p><strong>Refresh failed</strong></p>
        <p>The synced project feed could not be loaded right now. Please try again in a moment.</p>
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
    return String(value)
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

  function normalizeReadmeState(readmeState) {
    const state = readmeState && typeof readmeState === 'object' ? readmeState : {};
    const status = ['loaded', 'empty'].includes(state.status) ? state.status : 'empty';
    const text = typeof state.text === 'string' ? state.text.trim() : '';

    return {
      status: status === 'loaded' && !text ? 'empty' : status,
      text
    };
  }

  function mapFeedRepository(repository) {
    const source = repository && typeof repository === 'object' ? repository : {};
    const title = typeof source.title === 'string' && source.title.trim()
      ? source.title.trim()
      : formatRepositoryName(source.name || 'repository');
    const category = typeof source.category === 'string' && source.category.trim()
      ? source.category.trim()
      : 'Repository';
    const tags = Array.isArray(source.tags)
      ? [...new Set(source.tags.filter(Boolean).map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 6)
      : [];

    return {
      id: source.id || source.name || title.toLowerCase().replace(/\s+/g, '-'),
      name: source.name || title.toLowerCase().replace(/\s+/g, '-'),
      title,
      category,
      tags: tags.length ? tags : [category],
      summary:
        typeof source.summary === 'string' && source.summary.trim()
          ? source.summary.trim()
          : 'A repository summary is not exposed here yet. Open Details to review the synced README highlights.',
      github: source.github || `https://github.com/${GITHUB_USERNAME}/${source.name || ''}`,
      homepage: normalizeHomepageUrl(source.homepage || ''),
      updatedAt: source.updatedAt || source.updated_at || '',
      readme: normalizeReadmeState(source.readme)
    };
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
      const haystack = [
        repository.title,
        repository.name,
        repository.category,
        repository.summary,
        ...repository.tags,
        repository.readme.text
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
          The synced GitHub portfolio feed is not available right now. Please use <strong>Refresh Feed</strong> to try again.
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
                aria-controls="project-details-${escapeHtml(String(repository.id))}"
              >
                <span>Details</span>
                <span class="project-disclosure-arrow" aria-hidden="true"></span>
              </button>
            </div>
            <div class="project-details" id="project-details-${escapeHtml(String(repository.id))}" hidden></div>
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

  function applyRepositoryState(nextRepositories) {
    repositories = nextRepositories;
    repositoryLookup = new Map(repositories.map((repository) => [repository.name, repository]));
    filterOrder = ['All', ...new Set(repositories.map((repository) => repository.category))];
    activeFilter = filterOrder.includes(activeFilter) ? activeFilter : 'All';
    currentPage = Math.min(currentPage, getTotalPages(repositories.length));
    setRepositoryCount(repositories.length);
  }

  function persistRepositoryCache(meta = {}) {
    localStorage.setItem(REPOSITORY_CACHE_KEY, JSON.stringify(repositories));
    localStorage.setItem(
      REPOSITORY_CACHE_META_KEY,
      JSON.stringify({
        generatedAt: meta.generatedAt || new Date().toISOString(),
        source: meta.source || 'synced-feed'
      })
    );
  }

  function restoreRepositoryCache() {
    try {
      const cachedRepositories = JSON.parse(localStorage.getItem(REPOSITORY_CACHE_KEY) || '[]');

      if (!Array.isArray(cachedRepositories) || !cachedRepositories.length) {
        return false;
      }

      applyRepositoryState(cachedRepositories.map(mapFeedRepository));
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

  async function fetchRepositories(options = {}) {
    const { force = false } = options;
    const requestUrl = force ? `${PROJECT_FEED_PATH}?v=${Date.now()}` : PROJECT_FEED_PATH;

    isLoadingRepositories = true;
    setProjectSummary('Loading the auto-synced portfolio feed...');
    setProjectRefreshState();
    renderFilters();
    renderProjects();

    try {
      const response = await fetch(requestUrl, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Repository feed request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const nextRepositories = Array.isArray(payload.repositories)
        ? payload.repositories.map(mapFeedRepository)
        : [];
      const generatedAt = payload?.meta?.generatedAt || new Date().toISOString();

      applyRepositoryState(
        nextRepositories.sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt))
      );
      persistRepositoryCache({
        generatedAt,
        source: payload?.meta?.source || 'synced-feed'
      });
      setProjectSummary(
        `${repositories.length} public repositories are available in the auto-synced GitHub feed${generatedAt ? ` as of ${formatSyncTime(generatedAt)}` : ''}. Open Details to review stored README highlights.`
      );

      return {
        ok: true,
        count: repositories.length,
        generatedAt
      };
    } catch (error) {
      const restored = restoreRepositoryCache();
      const { generatedAt } = getRepositoryCacheMeta();

      if (restored) {
        setProjectSummary(
          `The latest synced feed could not be reached right now, so the most recent cached portfolio data${generatedAt ? ` from ${formatSyncTime(generatedAt)}` : ''} is being shown.`
        );
        return { ok: false, cached: true, error };
      }

      repositories = [];
      repositoryLookup = new Map();
      filterOrder = ['All'];
      activeFilter = 'All';
      setRepositoryCount(0);
      setProjectSummary('The synced project feed could not be loaded right now. Please use Refresh Feed to try again.');
      return { ok: false, cached: false, error };
    } finally {
      isLoadingRepositories = false;
      setProjectRefreshState();
      renderFilters();
      renderProjects();
    }
  }

  function renderReadmeState(repository) {
    if (repository.readme.status === 'loaded') {
      return `
        <div class="project-readme">
          ${renderReadmeHtml(repository.readme.text)}
          <a class="project-inline-link" href="${escapeHtml(repository.github)}#readme" target="_blank" rel="noreferrer">
            Open full README on GitHub
          </a>
        </div>
      `;
    }

    return `
      <p class="project-detail-note">
        This repository does not expose synced README details yet. You can still open the full repository on GitHub.
      </p>
    `;
  }

  function handleReadmeToggle(button) {
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
    panel.innerHTML = renderReadmeState(repository);
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
        description: 'Jump to the synced GitHub project feed.'
      },
      {
        command: 'refresh',
        title: 'Refresh',
        description: 'Reload the latest synced repository feed.'
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

  projectGrid.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('[data-readme-toggle]');

    if (!toggleButton) {
      return;
    }

    handleReadmeToggle(toggleButton);
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
  renderSkills();
  renderSocialLinks();
  renderCommandShortcuts();
  setCommandOutput(commandResponses.help());

  const restoredCache = restoreRepositoryCache();

  if (restoredCache) {
    const { generatedAt } = getRepositoryCacheMeta();
    setProjectSummary(
      `Showing the most recent cached portfolio feed${generatedAt ? ` from ${formatSyncTime(generatedAt)}` : ''}.`
    );
    renderFilters();
    renderProjects();
  }

  void fetchRepositories({ force: true });
});
