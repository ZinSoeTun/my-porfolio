import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ZinSoeTun';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const README_PREVIEW_LIMIT = 960;
const OUTPUT_PATH = path.resolve(process.cwd(), 'data', 'projects.json');

function createHeaders(extraHeaders = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': `${GITHUB_USERNAME}-portfolio-sync`,
    ...extraHeaders
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: createHeaders()
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub request failed (${response.status}) for ${url}: ${details.slice(0, 200)}`);
  }

  return response.json();
}

async function fetchText(url, extraHeaders = {}) {
  const response = await fetch(url, {
    headers: createHeaders({
      Accept: 'text/html,application/xhtml+xml',
      ...extraHeaders
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Request failed (${response.status}) for ${url}: ${details.slice(0, 200)}`);
  }

  return response.text();
}

async function fetchReadmePreview(repositoryName) {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repositoryName}/readme`, {
      headers: createHeaders({
        Accept: 'application/vnd.github.raw+json'
      })
    });

    if (response.status === 404) {
      return { status: 'empty', text: '' };
    }

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`README request failed (${response.status}) for ${repositoryName}: ${details.slice(0, 200)}`);
    }

    const markdown = await response.text();
    const preview = extractReadmePreview(markdown);

    return preview
      ? { status: 'loaded', text: preview }
      : { status: 'empty', text: '' };
  } catch (error) {
    if (GITHUB_TOKEN) {
      throw error;
    }

    return fetchReadmePreviewFromRepositoryPage(repositoryName);
  }
}

function formatRepositoryName(name = '') {
  return name
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
  return [...new Set([repo.language, ...(repo.topics || [])].filter(Boolean))].slice(0, 6);
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

function decodeHtmlEntities(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripHtml(html = '') {
  return decodeHtmlEntities(html)
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<li[^>]*>/gi, '\n')
    .replace(/<\/(p|div|section|article|h1|h2|h3|h4|h5|h6|li)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function createPreviewFromText(text = '') {
  if (!text) {
    return '';
  }

  const paragraphs = text
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

  return preview || text.slice(0, README_PREVIEW_LIMIT).trim();
}

function extractReadmePreview(markdown = '') {
  return createPreviewFromText(stripMarkdown(markdown));
}

function extractReadmePreviewFromHtml(html = '') {
  return createPreviewFromText(stripHtml(html));
}

function parseEmbeddedRepositoryData(pageHtml = '') {
  const match = pageHtml.match(
    /<script type="application\/json" data-target="react-app\.embeddedData">([\s\S]*?)<\/script>/
  );

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    return null;
  }
}

function parseRepositoryBlocks(profileHtml = '') {
  const blocks = profileHtml.match(/<li[^>]*itemprop="owns"[\s\S]*?(?=<li[^>]*itemprop="owns"|<\/ul>)/g) || [];

  return blocks
    .map((block) => {
      const nameMatch = block.match(/href="\/[^/]+\/([^"/?#]+)"\s+itemprop="name codeRepository"/);

      if (!nameMatch) {
        return null;
      }

      const name = decodeHtmlEntities(nameMatch[1].trim());
      const descriptionMatch = block.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/);
      const languageMatch = block.match(/itemprop="programmingLanguage">([\s\S]*?)<\/span>/);
      const updatedAtMatch = block.match(/<relative-time datetime="([^"]+)"/);

      return {
        id: name,
        name,
        description: descriptionMatch ? stripHtml(descriptionMatch[1]) : '',
        language: languageMatch ? decodeHtmlEntities(languageMatch[1].trim()) : '',
        updated_at: updatedAtMatch ? updatedAtMatch[1] : '',
        html_url: `https://github.com/${GITHUB_USERNAME}/${name}`,
        homepage: '',
        topics: []
      };
    })
    .filter(Boolean);
}

async function fetchReadmePreviewFromRepositoryPage(repositoryName) {
  const pageHtml = await fetchText(`https://github.com/${GITHUB_USERNAME}/${repositoryName}`);
  const embedded = parseEmbeddedRepositoryData(pageHtml);
  const overviewFiles = embedded?.payload?.codeViewRepoRoute?.overview?.overviewFiles;
  const readmeFile = Array.isArray(overviewFiles)
    ? overviewFiles.find((file) => file?.preferredFileType === 'readme') || overviewFiles[0]
    : null;
  const preview = readmeFile?.richText ? extractReadmePreviewFromHtml(readmeFile.richText) : '';

  return preview
    ? { status: 'loaded', text: preview }
    : { status: 'empty', text: '' };
}

async function fetchRepositoriesViaApi() {
  const repositories = [];
  let page = 1;

  while (true) {
    const payload = await fetchJson(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&page=${page}`
    );

    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    repositories.push(...payload);

    if (payload.length < 100) {
      break;
    }

    page += 1;
  }

  return repositories
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((first, second) => new Date(second.updated_at) - new Date(first.updated_at));
}

async function fetchRepositoriesViaHtml() {
  const repositories = [];
  let page = 1;

  while (true) {
    const profileHtml = await fetchText(`https://github.com/${GITHUB_USERNAME}?page=${page}&tab=repositories`);
    const pageRepositories = parseRepositoryBlocks(profileHtml);

    if (!pageRepositories.length) {
      break;
    }

    repositories.push(...pageRepositories);
    page += 1;
  }

  const uniqueRepositories = [...new Map(repositories.map((repository) => [repository.name, repository])).values()];
  const enrichedRepositories = await mapWithConcurrency(
    uniqueRepositories,
    async (repository) => ({
      ...repository,
      readme: await fetchReadmePreviewFromRepositoryPage(repository.name)
    }),
    4
  );

  return enrichedRepositories.sort((first, second) => new Date(second.updated_at) - new Date(first.updated_at));
}

async function mapWithConcurrency(items, worker, concurrency = 4) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length || 1) }, () => runWorker())
  );

  return results;
}

async function fetchRepositories() {
  try {
    return await fetchRepositoriesViaApi();
  } catch (error) {
    if (GITHUB_TOKEN) {
      throw error;
    }

    console.warn(`GitHub API fetch failed, falling back to public HTML scraping: ${error.message}`);
    return fetchRepositoriesViaHtml();
  }
}

async function buildPortfolioFeed() {
  const repositories = await fetchRepositories();
  const feedRepositories = await mapWithConcurrency(
    repositories,
    async (repo) => {
      const tags = getRepositoryTags(repo);
      let readme = repo.readme || { status: 'empty', text: '' };

      if (!repo.readme) {
        try {
          readme = await fetchReadmePreview(repo.name);
        } catch (error) {
          console.warn(`Skipping README preview for ${repo.name}: ${error.message}`);
        }
      }

      return {
      id: repo.id,
      name: repo.name,
      title: formatRepositoryName(repo.name),
      category: getRepositoryCategory(repo),
      tags: tags.length ? tags : ['Repository'],
      summary:
        repo.description?.trim() ||
        'A repository summary is not exposed here yet. Open Details to review the synced README highlights.',
      github: repo.html_url,
      homepage: normalizeHomepageUrl(repo.homepage || ''),
      updatedAt: repo.updated_at,
      readme
      };
    },
    4
  );

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      source: 'github-actions-sync',
      username: GITHUB_USERNAME,
      totalRepositories: feedRepositories.length
    },
    repositories: feedRepositories
  };
}

async function main() {
  const feed = await buildPortfolioFeed();

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(feed, null, 2)}\n`, 'utf8');

  console.log(`Synced ${feed.meta.totalRepositories} repositories to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
