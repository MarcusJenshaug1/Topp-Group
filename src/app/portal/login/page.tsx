import { Suspense } from "react"
import { LoginForm } from "@/app/portal/login/login-form"

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}
