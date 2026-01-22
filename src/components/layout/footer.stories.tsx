import type { Meta, StoryObj } from "@storybook/react"
import { Footer } from "./footer"

const meta = {
    title: "Layout/Footer",
    component: Footer,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Footer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => <Footer />,
}

export const Mobile: Story = {
    render: () => (
        <div className="max-w-sm">
            <Footer />
        </div>
    ),
}
