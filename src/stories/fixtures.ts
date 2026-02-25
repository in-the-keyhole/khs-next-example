import { GithubEvent } from '../lib/models/pageProps';

export const mockProfile = {
  name: 'Jane Doe',
  login: 'janedoe',
  location: 'Kansas City, MO',
  html_url: 'https://github.com/janedoe',
};

export const mockEvents: GithubEvent[] = [
  {
    id: '1',
    type: 'PushEvent',
    repo: { name: 'janedoe/my-project' },
    payload: { commits: [{ message: 'Fix login bug' }, { message: 'Update README' }] },
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'PullRequestEvent',
    repo: { name: 'janedoe/my-project' },
    payload: { commits: [] },
    created_at: '2024-01-14T08:00:00Z',
  },
  {
    id: '3',
    type: 'PushEvent',
    repo: { name: 'janedoe/other-repo' },
    payload: { commits: [{ message: 'Initial commit' }] },
    created_at: '2024-01-13T15:45:00Z',
  },
];
