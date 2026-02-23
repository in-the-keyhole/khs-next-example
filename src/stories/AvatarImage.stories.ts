import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AvatarImage } from '../lib/components/atoms/avatar-image';

const meta = {
  title: 'Components/Atoms/AvatarImage',
  component: AvatarImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AvatarImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/583231?v=4',
    alt: 'Profile Image',
  },
};

export const Large: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/583231?v=4',
    alt: 'Profile Image',
    size: 96,
  },
};
