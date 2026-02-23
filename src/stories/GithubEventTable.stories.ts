import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GithubEventTable } from '../lib/components/organisms/github-event-table';

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
  title: 'Components/Organisms/GithubEventTable',
  component: GithubEventTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof GithubEventTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEvents: Story = {
  args: {
    events: mockEvents,
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};
