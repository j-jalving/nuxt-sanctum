# Nuxt Sanctum Auth

[![npm version](https://badge.fury.io/js/nuxt-sanctum-auth.svg)](https://badge.fury.io/js/nuxt-sanctum-auth)

This is a simple package for integrating Laravel Sanctum auth with Nuxt3 based on [dystcz/nuxt-sanctum-auth](https://github.com/dystcz/nuxt-sanctum-auth) and [amrnn90/breeze-nuxt](https://github.com/amrnn90/breeze-nuxt). Credit goes out them them for creating most of the code in this repo.

This package is in development and has only been tested in **SPA** mode. Also this README needs to be updated to include new features.

## Installation

```bash
yarn add nuxt-sanctum-auth
# or
npm i nuxt-sanctum-auth
```

Import the module into the `nuxt.config.[js,ts]` and disable `ssr`.
Or alternatively disable `ssr` via `routeRules`, only for pages where `auth` or `guest` middlewares are needed. Typically account section and login page.

```js
export default defineNuxtConfig({
  ssr: false,
  // or
  routeRules: {
    '/account/**': { ssr: false },
    '/auth/**': { ssr: false }
  },

  modules: [
    'nuxt-sanctum-auth'
    // ...
  ]
})
```

You can also define options as below (defaults in example):

```js
export default defineNuxtConfig({
  // ...
  modules: [
    'nuxt-sanctum-auth'
    // ...
  ],
  nuxtSanctum: {
    token: false, // set true to use jwt-token auth instead of cookie. default is false
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
    csrf: {
      headerKey: 'X-XSRF-TOKEN',
      cookieKey: 'XSRF-TOKEN',
      tokenCookieKey: 'nuxt-sanctum-auth-token'
    },
    redirects: {
      home: '/account',
      login: '/auth/login',
      verify: '/auth/verify'
    }
  }
})
```

## Usage

Package provides you with `$sanctumAuth` plugin, which contains `register`, `login`, `forgotPassword`, `resetPassword`, `verifyEmail`, `resendEmailVerification`, `logout` and `getUser` methods.

### Login

```vue
<script setup>
const { $sanctumAuth } = useNuxtApp();
const router = useRouter();
const form = reactive({
  email: '',
  password: '',
});

const {
  submit,
  inProgress,
  validationErrors,
} = useSubmit(() => $sanctumAuth.login(form), {
  onSuccess: () => { 
    router.push('/');
  },
});
</script>
```

### Logout

```vue
<script setup>
const { $sanctumAuth } = useNuxtApp();
const router = useRouter();

const logout = async () => {
  await $sanctumAuth.logout().then(() => { router.push('/login') });
}
</script>
```

### Accessing user

The module creates a `useAuth()` composable that utilizes `useState('auth')` in the background. You can use it to get access to a user.

```vue
<script setup>
const { user, loggedIn } = useAuth() // or useState('auth').value
</script>

<template>
  <div>
    Is user logged in?
    <span>{{ loggedIn ? 'yes' : 'no' }}</span>
  </div>
  <div v-if="loggedIn">
    What is users name?
    <span>{{ user.name }}</span>
  </div>
</template>
```

### Middleware

Package automatically provides four middlewares for you to use: `auth`, `guest`, `verified` and `unverified`.
If you are using `routeRules` make sure to set `ssr: false` for all pages that will be using those middlewares. Please note that those middlewares are not global and are needed to be included on every protected page. Global middlewares are not possible for now, because of availability of `hybrid` mode.

#### Pages available only when not logged in

```vue
<script setup>
definePageMeta({
  middleware: 'guest'
})
</script>
```

#### Pages available only when logged in

```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Using JWT-token auth instead of cookie

If you want to use Laravel Sanctum with JWT token authentication method,
set the `token` property to true in the module configuration.

```js
nuxtSanctum: {
  token: true
  // other properties
}
```

Your Laravel backend should respond on the login endpoint with a json containing property `token`:

```json
{
  "token": "1|p1tEPICErFs9TpGKjfkz5QcWDi5M4YqJpVLGUwqM"
}
```

Once logged in, the token will be saved in a cookie.

If you need to access the token, use property of `useAuth()`

```vue
<script setup>
const { token } = useAuth()
</script>

<template>
  <div>
    What is auth jwt token?
    <span>{{ token }}</span>
  </div>
</template>
```

### Data fetching

In guarded pages, you can use the special fetching method `$larafetch`. This methods is responsible for carrying the XSRF or JWT auth token.

```vue
<script setup>
const { $larafetch } = useNuxtApp();
const { data: posts } = $larafetch("/posts", { method: "get" });
</script>
```

### Getting user info in pages/components without middleware

You absolutely can use user information on all pages, even on those that are not guarded by `auth` midleware.
Only downside is that you have to handle potential empty states your self. Typically on ssr pages, because user info is accessable only on client.

```vue
<script setup>
const { $sanctumAuth } = useNuxtApp()
const loading = ref(true)
const auth = useAuth() // return auth state

onMounted(async () => {
  await $sanctumAuth.getUser() // fetch and set user data
  // await $sanctumAuth.getUser({ refresh: true }) // force fetch user data

  loading.value = false
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <NuxtLink to="/auth/login" v-if="!auth.loggedIn"> Login </NuxtLink>
    <NuxtLink to="/account" v-else> My Account </NuxtLink>
  </div>
</template>
```

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start playground in development mode.
