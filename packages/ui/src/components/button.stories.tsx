import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Usuń',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Anuluj',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Mały',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Duży przycisk',
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: 'Ładowanie...',
  },
};
