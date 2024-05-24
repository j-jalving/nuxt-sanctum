import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImportsDir
} from '@nuxt/kit'
import { type ModuleOptions } from './types'

const defaults: ModuleOptions = {
  token: false,
  baseUrl: 'http://localhost:8000',
  endpoints: {
    csrf: '/sanctum/csrf-cookie',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/verify-email',
    verificationNotification: '/email/verification-notification',
    login: '/login',
    logout: '/logout',
    user: '/user'
  },
  csrf: {
    headerKey: 'X-XSRF-TOKEN',
    cookieKey: 'XSRF-TOKEN',
    tokenCookieKey: 'nuxt-sanctum-token'
  },
  redirects: {
    home: '/',
    login: '/login',
    verify: '/verify'
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-sanctum',
    configKey: 'nuxtSanctum'
  },
  defaults,
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.nuxtSanctum = options
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('./runtime/plugin'))
    addImportsDir(resolve('./runtime/composables'))
  }
})
