import { type FetchOptions } from 'ofetch'

export interface Endpoints {
  csrf: string
  register: string
  forgotPassword: string
  resetPassword: string
  verifyEmail: string
  verificationNotification: string
  login: string
  logout: string
  user: string
}

export interface Redirects {
  home: string
  login: string
  verify: string
}

export interface ModuleOptions {
  csrf: CSRFSpec
  token: boolean
  baseUrl: string
  endpoints: Endpoints
  redirects: Redirects
}

export interface Auth {
  user: any | null
  loggedIn: boolean
  token: string | null
}

export interface CSRFSpec {
  headerKey: string
  cookieKey: string
  tokenCookieKey: string
}

export type Larafetch = <T>(
  request: RequestInfo,
  options?: FetchOptions
) => Promise<T>

export type Csrf = string | null | undefined;

export interface SanctumAuthPlugin {
  register: (body: any) => Promise<{ status: string }>
  login: (body: any) => Promise<{ status: string, token?: string }>
  forgotPassword: (body: any) => Promise<{ status: string }>
  resetPassword: (body: any) => Promise<{ status: string }>
  verifyEmail: (body: any) => Promise<{ status: string }>
  resendEmailVerification: () => Promise<{ status: string }>
  logout: () => Promise<void>
  getUser<T>({ refresh }?: { refresh?: boolean }): () => Promise<T | undefined>

}

// @ts-ignore
declare module 'vue/types/vue' {
  interface Vue {
    $sanctumAuth: SanctumAuthPlugin
  }
}

// Nuxt Bridge & Nuxt 3
declare module '#app' {
  interface NuxtApp extends PluginInjection {}
}

interface PluginInjection {
  $sanctumAuth: SanctumAuthPlugin
  $larafetch: Larafetch
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends PluginInjection {}
}
