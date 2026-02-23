import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeroSection } from '../lib/components/organisms/hero-section';

const meta = {
  title: 'Components/Organisms/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithUserName: Story = {
  args: {
    name: 'Jane Doe',
  },
};