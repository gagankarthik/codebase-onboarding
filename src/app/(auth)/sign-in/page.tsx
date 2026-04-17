"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, GitBranch } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { signIn } from "@/lib/auth/cognito"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Metadata } from "next"

const SignInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})
type SignInData = z.infer<typeof SignInSchema>

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({ resolver: zodResolver(SignInSchema) })

  async function onSubmit(data: SignInData) {
    try {
      const result = await signIn(data.email, data.password)
      if (result.isSignedIn) {
        router.push("/dashboard")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed"
      if (message.includes("UserNotFoundException") || message.includes("NotAuthorizedException")) {
        toast.error("Incorrect email or password — check your credentials and try again.")
      } else if (message.includes("UserNotConfirmedException")) {
        toast.error("Please verify your email address before signing in.")
      } else {
        toast.error(message)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground-muted">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-foreground-muted hover:text-foreground">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs text-foreground-muted">
          <span className="bg-background px-3">or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full gap-2" asChild>
        <a href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo`}>
          <GitBranch className="h-4 w-4" />
          Continue with GitHub
        </a>
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
