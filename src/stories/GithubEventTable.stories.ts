import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GithubEventTable } from '../lib/components/organisms/github-event-table';
import { mockEvents } from './fixtures';

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
