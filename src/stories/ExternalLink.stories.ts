import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ExternalLink } from '../lib/components/atoms/external-link';

const meta = {
  title: 'Components/Atoms/ExternalLink',
  component: ExternalLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: 'https://github.com/janedoe',
    children: 'Github Profile Link',
  },
};
