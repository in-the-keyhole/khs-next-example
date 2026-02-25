import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GithubPage } from '../lib/components/pages/github';
import { mockProfile, mockEvents } from './fixtures';

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
