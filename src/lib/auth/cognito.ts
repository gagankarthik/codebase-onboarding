"use client"

import { Amplify } from "aws-amplify"
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
} from "@aws-amplify/auth"

let configured = false

export function configureAmplify(): void {
  if (configured) return
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "",
      },
    },
  })
  configured = true
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ userId?: string; isSignUpComplete: boolean }> {
  const result = await amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: { email, name },
    },
  })
  return {
    userId: result.userId,
    isSignUpComplete: result.isSignUpComplete,
  }
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  await amplifyConfirmSignUp({ username: email, confirmationCode: code })
}

export async function signIn(
  email: string,
  password: string
): Promise<{ isSignedIn: boolean }> {
  const result = await amplifySignIn({ username: email, password })
  return { isSignedIn: result.isSignedIn }
}

export async function signOut(): Promise<void> {
  await amplifySignOut()
}

export async function getCurrentUser(): Promise<{ userId: string; email: string; name: string } | null> {
  try {
    const user = await amplifyGetCurrentUser()
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken
    const payload = idToken?.payload ?? {}
    return {
      userId: user.userId,
      email: (payload["email"] as string) ?? user.signInDetails?.loginId ?? "",
      name: (payload["name"] as string) ?? "",
    }
  } catch {
    return null
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.accessToken?.toString() ?? null
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken()
  return token !== null
}
