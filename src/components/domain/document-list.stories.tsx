import type { Meta, StoryObj } from "@storybook/react"

import { DocumentList } from "./document-list"

const meta = {
    title: "Domain/DocumentList",
    component: DocumentList,
    tags: ["autodocs"],
} satisfies Meta<typeof DocumentList>

export default meta

type Story = StoryObj<typeof meta>

const documents = [
    {
        id: "1",
        title: "Årsrapport 2024",
        file_path: "reports/arsrapport-2024.pdf",
        created_at: new Date().toISOString(),
        mime_type: "application/pdf",
        document_categories: { name: "Rapporter" },
    },
    {
        id: "2",
        title: "Prosjektoversikt",
        file_path: "reports/prosjektoversikt.pdf",
        created_at: new Date().toISOString(),
        mime_type: "application/pdf",
        document_categories: { name: "Prosjekter" },
    },
]

export const Default: Story = {
    args: {
        documents,
    },
    parameters: {
        docs: {
            description: {
                story: "Modal preview uses a calm overlay fade and panel scale-in.",
            },
        },
    },
}

export const ReducedMotion: Story = {
    render: (args) => (
        <div className="reduce-motion">
            <DocumentList {...args} />
        </div>
    ),
    args: {
        documents,
    },
}
