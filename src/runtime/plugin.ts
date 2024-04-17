import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useState,
  useRuntimeConfig,
  useCookie,
  useRequestHeaders
} from '#app'
import { type ModuleOptions, type Auth, type Csrf } from '../types'

export default defineNuxtPlugin(async () => {
  const auth = useState<Auth>('auth', () => {
    return {
      user: null,
      loggedIn: false,
      token: null
    }
  })

  const config: ModuleOptions = useRuntimeConfig().public.nuxtSanctumAuth as ModuleOptions

  addRouteMiddleware('auth', async () => {
    if (config.token) {
      getToken()
    }
    await getUser()

    if (auth.value.loggedIn === false) {
      return config.redirects.login
    }
  })

  addRouteMiddleware('guest', async () => {
    if (config.token) {
      getToken()
    }
    await getUser()

    if (auth.value.loggedIn) {
      return config.redirects.home
    }
  })

  addRouteMiddleware('verified', async () => {
    if (config.token) {
      getToken()
    }
    await getUser()

    if (auth.value.loggedIn === false) {
      return config.redirects.login
    }

    if (!auth.value.user.email_verified_at) {
      return config.redirects.verify
    }
  })

  addRouteMiddleware('unverified', async () => {
    if (config.token) {
      getToken()
    }
    await getUser()

    if (auth.value.user.email_verified_at) {
      return config.redirects.home
    }
  })

  const larafetch = $fetch.create({
    credentials: "include",
    async onRequest({ request, options }) {
      const auth = useState<Auth>('auth', () => {
        return {
          user: null,
          loggedIn: false,
          token: null
        }
      })
      const config: ModuleOptions = useRuntimeConfig().public.nuxtSanctumAuth as ModuleOptions
      const event = typeof useEvent === "function" ? useEvent() : null;
      let token = event
        ? parseCookies(event)[config.csrf.cookieKey]
        : useCookie(config.csrf.cookieKey).value;
  
      // on client initiate a csrf request and get it from the cookie set by laravel
      if (
        process.client &&
        ["post", "delete", "put", "patch"].includes(
          options?.method?.toLowerCase() ?? ""
        )
      ) {
        token = await initCsrf();
      }
  
      let headers: HeadersInit = {
        Accept: "application/json",
        ...options?.headers,
        ...(token && { [config.csrf.headerKey]: token }),
        Authorization: config.token ? 'Bearer ' + auth.value.token : ""
      };

      if (process.server) {
        const cookieString = event
          ? event.headers.get("cookie")
          : useRequestHeaders(["cookie"]).cookie;
  
        headers = {
          ...headers,
          ...(cookieString && { cookie: cookieString }),
          // referer: frontendUrl,
        };
      }
  
      options.headers = headers;
      options.baseURL = config.baseUrl;
    },
    async onResponseError({ response }) {
      const status = response.status;
      if ([500].includes(status)) {
        console.error("[Laravel Error]", response.statusText, response._data);
      }
    },
  });
  
  async function initCsrf(): Promise<Csrf> {
    const config: ModuleOptions = useRuntimeConfig().public.nuxtSanctumAuth as ModuleOptions
    const existingToken = useCookie(config.csrf.cookieKey).value;
  
    if (existingToken) return existingToken;
  
    await $fetch(config.endpoints.csrf, {
      baseURL: config.baseUrl,
      credentials: "include",
    });
  
    return useCookie(config.csrf.cookieKey).value;
  }

  const getToken = () => {
    auth.value.token = useCookie(config.csrf.tokenCookieKey)?.value || null
  }

  const setToken = (token: string) => {
    useCookie(config.csrf.tokenCookieKey).value = token
  }

  const clearToken = () => {
    useCookie(config.csrf.tokenCookieKey).value = null
  }

  const register = async (body: any): Promise<{ status: string }> => {
    return await larafetch<{ status: string }>(config.endpoints.register, {
      method: "post",
      body
    });
  }

  const login = async (body: any): Promise<{ status: string, token?: string }> => {
    const response = await larafetch<{ status: string, token?: string }>(config.endpoints.login, {
      method: "post",
      body: JSON.stringify(body)
    });

    if (config.token && response && response.token) {
      setToken(response.token)
    }
    
    return response; 
  }

  const forgotPassword = async (body: any): Promise<{ status: string }> => {
    return await larafetch<{ status: string }>('/forgot-password', {
      method: "post",
      body
    });
  }

  const resetPassword = async (body: any): Promise<{ status: string }> => {
    return await larafetch<{ status: string }>("/reset-password", {
      method: "post",
      body,
    });
  }
  
  const verifyEmail = async (body: any): Promise<{ status: string }> => {
    return await larafetch<{ status: string }>('/verify-email', {
      method: "post",
      body
    });
  }

  const resendEmailVerification = async (): Promise<{ status: string }> => {
    return await larafetch<{ status: string }>('/email/verification-notification', {
      method: "post",
    });
  }

  const logout = async (): Promise<void> => {
    try {
      await larafetch<{ status: string }>(config.endpoints.logout, {
        method: "post",
      });
    } catch (error) {
      console.log(error)
    } finally {
      auth.value.loggedIn = false
      auth.value.user = null
      auth.value.token = null
      clearToken()
    }
  }

  async function getUser<T>({ refresh = false }: {refresh?: boolean; } = {}): Promise<T | undefined> {
    if (!refresh && auth.value.loggedIn && auth.value.user) {
      return auth.value.user as T;
    }

    try {
      const user = await larafetch(config.endpoints.user, {
        method: "get",
      });
  
      if (user) {
        auth.value.loggedIn = true
        auth.value.user = user
        return user as T
      }
    } catch (error) {
      console.log(error)
    }
  }

  return {
    provide: {
      larafetch,
      sanctumAuth: {
        register,
        login,
        verifyEmail,
        resendEmailVerification,
        forgotPassword,
        resetPassword,
        logout,
        getUser,
      }
    }
  }
})
