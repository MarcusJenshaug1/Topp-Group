import { Suspense } from "react"
import { CompleteAccountForm } from "@/app/portal/complete/complete-form"

export default function CompleteAccountPage() {
    return (
        <Suspense>
            <CompleteAccountForm />
        </Suspense>
    )
}
