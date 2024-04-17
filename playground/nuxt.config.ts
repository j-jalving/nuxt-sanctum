import { defineNuxtConfig } from 'nuxt/config'
import nuxtSanctumAuth from '../dist/module'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'nuxt-sanctum-auth'
    }
  },

  routeRules: {
    '/account/**': { ssr: false },
    '/auth/**': { ssr: false }
  },

  //@ts-ignore
  modules: [nuxtSanctumAuth, '@nuxtjs/tailwindcss'],

  nuxtSanctumAuth: {
    token: false, // set true to test jwt-token auth instead of cookie
    baseUrl: 'http://localhost:8000',
    endpoints: {
      csrf: '/sanctum/csrf-cookie',
      register: '/register',
      forgotPassword: '/forgot-password',
      resetPassword: '/reset-password',
      verifyEmail: '/verify-email',
      verificationNotification: '/verification-notification',
      login: '/login',
      logout: '/logout',
      user: '/user'
    },
    redirects: {
      home: '/account',
      login: '/auth/login',
      verify: '/auth/verify'
    }
  }
})
