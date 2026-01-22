import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
    title: 'UI/Input',
    component: Input,
    tags: ['autodocs'],
    argTypes: {
        disabled: { control: 'boolean' },
        placeholder: { control: 'text' },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'text',
        placeholder: 'Type here...',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: 'Disabled input',
    },
};

export const ReducedMotion: Story = {
    render: (args) => (
        <div className="reduce-motion">
            <Input {...args} />
        </div>
    ),
    args: {
        type: 'text',
        placeholder: 'Reduced motion input',
    },
};
