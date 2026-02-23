import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GithubPage } from '../lib/components/pages/github';

const mockProfile = {
  name: 'Jane Doe',
  login: 'janedoe',
  location: 'Kansas City, MO',
  html_url: 'https://github.com/janedoe',
};

const mockEvents = [
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

const meta = {
  title: 'Components/Pages/GithubPage',
  component: GithubPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GithubPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullProfile: Story = {
  args: {
    profile: mockProfile,
    events: mockEvents,
  },
};

export const NoLocation: Story = {
  args: {
    profile: { name: 'Jane Doe', login: 'janedoe', html_url: 'https://github.com/janedoe' },
    events: mockEvents,
  },
};

export const NoEvents: Story = {
  args: {
    profile: mockProfile,
    events: [],
  },
};
