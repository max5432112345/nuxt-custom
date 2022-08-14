**Information**

This module is an adaptation of `https://github.com/Teranode/nuxt-module-alternatives/tree/master/%40nuxtjs-alt/http` to use $fetch instead axios, http or ohmyfetch.
This serves as an alternative to `@nuxtjs/axios`, `@nuxtjs/http`. Please note this is only for nuxt3.
This works similar to nuxt/http and nuxtjs-alt/axios except it utilizes Nuxt 3 $fetch. All property options will be under `http`

**Other Information**

If you want to experiment you may use the `useConflict: true` property to change `$http`, `useHttp`, `useLazyHttp`, `globalThis.$http`, to `$fetch`, `useFetch`, `useLazyFetch`, `globalThis.$fetch`.

Remember this is a mix of `$fetch`, `nuxt/axios` and `nuxt/http` so to use methods you would use eg. `$fetch.$get(<url>, <options>) | $http.$get(<url>, <options>)` or `$fetch.get(<url>, <options>) | $http.get(<url>, <options>)` all options relative to `ohmyfetch` can be registered as a secondary parameter within the method. Or `this.ctx.$fetch.create().$get(<url>, <options>) | this.ctx.$http.create().$get(<url>, <options>)`.

Using the `$` (eg. `$http.$get()`) or `$fetch.create()` are the same.

**Interceptors**

The interceptors should work exactly like how axios has it so to access them you would use:

```ts
$http.interceptors.request.use()
$http.interceptors.response.use()

```

@nuxtjs-axios based functions have also been added:

```ts
$http.onRequest()
$http.onResponse()
$http.onRequestError()
$http.onResponseError()
$http.onError()
```

Please do tell me if you encounter any bugs.