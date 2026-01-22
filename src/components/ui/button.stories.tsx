import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { ArrowRight } from 'lucide-react';

const meta = {
    title: 'UI/Button',
    component: Button,
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
        disabled: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        variant: 'default',
        children: 'Button',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Destructive',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost',
    },
};

export const Link: Story = {
    args: {
        variant: 'link',
        children: 'Link',
    },
};

export const WithArrow: Story = {
    render: (args) => (
        <Button {...args} className="btn-arrow">
            {args.children}
            <ArrowRight className="btn-arrow-icon" />
        </Button>
    ),
    args: {
        variant: 'default',
        children: 'Se mer',
    },
    parameters: {
        docs: {
            description: {
                story: 'Hover: arrow icon shifts 2px to the right. Active: subtle scale down.',
            },
        },
    },
};

export const ReducedMotion: Story = {
    render: (args) => (
        <div className="reduce-motion">
            <Button {...args}>Reduced motion</Button>
        </div>
    ),
    args: {
        variant: 'secondary',
    },
};
