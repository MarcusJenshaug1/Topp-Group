import { Suspense } from "react"
import { ResetPasswordForm } from "@/app/portal/reset/reset-form"

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    )
}
