import { tool } from 'ai';
import { z } from 'zod';

const GITHUB_API_BASE = 'https://api.github.com';

async function makeGitHubRequest(endpoint: string, token: string) {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Tools-Client',
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export const getGitHubRepoSearchTool = () => {
  return tool({
    description:
      'Search for GitHub repositories using various criteria like name, description, topics, language, etc.',
    parameters: z.object({
      query: z
        .string()
        .describe(
          'Search query for repositories (e.g., "react typescript", "language:python", "topic:machine-learning")',
        ),
      sort: z
        .enum(['stars', 'forks', 'help-wanted-issues', 'updated'])
        .optional()
        .describe('Sort repositories by criteria'),
      order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
      per_page: z
        .number()
        .min(1)
        .max(10)
        .optional()
        .default(30)
        .describe('Number of results per page (1-100)'),
      page: z
        .number()
        .min(1)
        .optional()
        .default(1)
        .describe('Page number for pagination'),
    }),
    execute: async ({ query, sort, order, per_page, page }) => {
      const githubToken = process.env.GITHUB_REPO_TOKEN;

      if (!githubToken) {
        throw new Error('GitHub PAT token not found in environment variables');
      }

      try {
        const params = new URLSearchParams({
          q: query,
          ...(sort && { sort }),
          ...(order && { order }),
          per_page: per_page.toString(),
          page: page.toString(),
        });

        const data = await makeGitHubRequest(
          `/search/repositories?${params}`,
          githubToken,
        );

        return {
          total_count: data.total_count,
          incomplete_results: data.incomplete_results,
          repositories: data.items.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            clone_url: repo.clone_url,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            open_issues_count: repo.open_issues_count,
            topics: repo.topics,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            owner: {
              login: repo.owner.login,
              type: repo.owner.type,
              html_url: repo.owner.html_url,
            },
          })),
        };
      } catch (error) {
        throw new Error(`Failed to search repositories: ${error.message}`);
      }
    },
  });
};

export const getGitHubCodeSearchTool = () => {
  return tool({
    description:
      'Search for code across GitHub repositories using various criteria like filename, extension, repository, user, etc.',
    parameters: z.object({
      query: z
        .string()
        .describe(
          'Search query for code (e.g., "function addClass", "filename:package.json", "extension:ts user:microsoft")',
        ),
      sort: z
        .enum(['indexed', 'best-match'])
        .optional()
        .describe('Sort code results by criteria'),
      order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
      per_page: z
        .number()
        .min(1)
        .max(10)
        .optional()
        .default(30)
        .describe('Number of results per page (1-100)'),
      page: z
        .number()
        .min(1)
        .optional()
        .default(1)
        .describe('Page number for pagination'),
    }),
    execute: async ({ query, sort, order, per_page, page }) => {
      const githubToken = process.env.GITHUB_REPO_TOKEN;

      if (!githubToken) {
        throw new Error('GitHub PAT token not found in environment variables');
      }

      try {
        const params = new URLSearchParams({
          q: query,
          ...(sort && { sort }),
          ...(order && { order }),
          per_page: per_page.toString(),
          page: page.toString(),
        });

        const data = await makeGitHubRequest(
          `/search/code?${params}`,
          githubToken,
        );

        return {
          total_count: data.total_count,
          incomplete_results: data.incomplete_results,
          code_results: data.items.map((item: any) => ({
            name: item.name,
            path: item.path,
            sha: item.sha,
            url: item.url,
            git_url: item.git_url,
            html_url: item.html_url,
            repository: {
              id: item.repository.id,
              name: item.repository.name,
              full_name: item.repository.full_name,
              html_url: item.repository.html_url,
              description: item.repository.description,
              language: item.repository.language,
              owner: {
                login: item.repository.owner.login,
                type: item.repository.owner.type,
              },
            },
            score: item.score,
          })),
        };
      } catch (error) {
        throw new Error(`Failed to search code: ${error.message}`);
      }
    },
  });
};

export const getGitHubRepoDetailsTool = () => {
  return tool({
    description: 'Get detailed information about a specific GitHub repository',
    parameters: z.object({
      owner: z.string().describe('Repository owner (username or organization)'),
      repo: z.string().describe('Repository name'),
    }),
    execute: async ({ owner, repo }) => {
      const githubToken = process.env.GITHUB_REPO_TOKEN;

      if (!githubToken) {
        throw new Error('GitHub PAT token not found in environment variables');
      }

      try {
        const data = await makeGitHubRequest(
          `/repos/${owner}/${repo}`,
          githubToken,
        );

        return {
          id: data.id,
          name: data.name,
          full_name: data.full_name,
          description: data.description,
          html_url: data.html_url,
          clone_url: data.clone_url,
          ssh_url: data.ssh_url,
          language: data.language,
          languages_url: data.languages_url,
          stargazers_count: data.stargazers_count,
          watchers_count: data.watchers_count,
          forks_count: data.forks_count,
          open_issues_count: data.open_issues_count,
          topics: data.topics,
          license: data.license,
          default_branch: data.default_branch,
          created_at: data.created_at,
          updated_at: data.updated_at,
          pushed_at: data.pushed_at,
          size: data.size,
          owner: {
            login: data.owner.login,
            type: data.owner.type,
            html_url: data.owner.html_url,
          },
          private: data.private,
          fork: data.fork,
          archived: data.archived,
          disabled: data.disabled,
        };
      } catch (error) {
        throw new Error(`Failed to get repository details: ${error.message}`);
      }
    },
  });
};

export const getGitHubFileContentTool = () => {
  return tool({
    description: 'Get the content of a specific file from a GitHub repository',
    parameters: z.object({
      owner: z.string().describe('Repository owner (username or organization)'),
      repo: z.string().describe('Repository name'),
      path: z.string().describe('File path within the repository'),
      ref: z
        .string()
        .optional()
        .describe('Branch, tag, or commit SHA (defaults to default branch)'),
    }),
    execute: async ({ owner, repo, path, ref }) => {
      const githubToken = process.env.GITHUB_REPO_TOKEN;

      if (!githubToken) {
        throw new Error('GitHub PAT token not found in environment variables');
      }

      try {
        const endpoint = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
        const data = await makeGitHubRequest(endpoint, githubToken);

        if (data.type === 'file' && data.content) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          return {
            name: data.name,
            path: data.path,
            sha: data.sha,
            size: data.size,
            url: data.url,
            html_url: data.html_url,
            git_url: data.git_url,
            download_url: data.download_url,
            type: data.type,
            content: content,
            encoding: data.encoding,
          };
        }

        return data;
      } catch (error) {
        throw new Error(`Failed to get file content: ${error.message}`);
      }
    },
  });
};

export const getGitHubTools = () => {
  return {
    githubRepoSearch: getGitHubRepoSearchTool(),
    githubCodeSearch: getGitHubCodeSearchTool(),
    githubRepoDetails: getGitHubRepoDetailsTool(),
    githubFileContent: getGitHubFileContentTool(),
  };
};
