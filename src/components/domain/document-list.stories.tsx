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
        file_name: "arsrapport-2024.pdf",
        created_at: new Date().toISOString(),
        mime_type: "application/pdf",
        visibility: "authenticated" as const,
        document_categories: { name: "Rapporter" },
    },
    {
        id: "2",
        title: "Prosjektoversikt",
        file_path: "reports/prosjektoversikt.pdf",
        file_name: "prosjektoversikt.pdf",
        created_at: new Date().toISOString(),
        mime_type: "application/pdf",
        visibility: "admin_only" as const,
        document_categories: { name: "Prosjekter" },
    },
]

const categories = [
    { id: "rap", name: "Rapporter" },
    { id: "pro", name: "Prosjekter" },
]

export const Default: Story = {
    args: {
        documents,
        categories,
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
        categories,
    },
}
