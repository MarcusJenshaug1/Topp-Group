import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';

const meta = {
    title: 'UI/Card',
    component: Card,
    tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Card className="w-[350px] hover:-translate-y-0.5">
            <CardHeader>
                <CardTitle>Project Title</CardTitle>
                <CardDescription>Project description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Main content of the card.</p>
            </CardContent>
            <CardFooter>
                <Button>Action</Button>
            </CardFooter>
        </Card>
    ),
    parameters: {
        docs: {
            description: {
                story: "Hover: subtle lift and shadow increase using motion tokens.",
            },
        },
    },
};

export const ReducedMotion: Story = {
    render: () => (
        <div className="reduce-motion">
            <Card className="w-[350px] hover:-translate-y-0.5">
                <CardHeader>
                    <CardTitle>Reduced Motion</CardTitle>
                    <CardDescription>Motion tokens disabled.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Main content of the card.</p>
                </CardContent>
                <CardFooter>
                    <Button>Action</Button>
                </CardFooter>
            </Card>
        </div>
    ),
};
