"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

interface PageEnterProps {
    children: React.ReactNode
}

export function PageEnter({ children }: PageEnterProps) {
    const pathname = usePathname()

    return (
        <div key={pathname} className="page-enter">
            {children}
        </div>
    )
}
