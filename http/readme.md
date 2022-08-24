**Information**

This module is an adaptation of `https://github.com/Teranode/nuxt-module-alternatives/tree/master/%40nuxtjs-alt/http` to use $fetch instead axios, http or ohmyfetch.
This serves as an alternative to `@nuxtjs/axios`, `@nuxtjs/http`. Please note this is only for nuxt3.
This works similar to nuxt/http and nuxtjs-alt/axios except it utilizes Nuxt 3 $fetch. All property options will be under `http`

**Other Information**

If you want to experiment you may use the `useConflict: true` property to change `$http`, `useHttp`, `useLazyHttp`, `globalThis.$http`, to `$fetch`, `useFetch`, `useLazyFetch`, `globalThis.$fetch`.

Remember this is a mix of `$fetch`, `nuxt/axios` and `nuxt/http` so to use methods you would use eg. `$fetch.$get(<options>) | $http.$get(<options>)`, options are the same as of `ohmyfetch` but also includes url. Or `this.ctx.$fetch.$get(<options>) | this.ctx.$http.$get(<options>)`.

Using without the `$` (eg. `$http.get()`) are the same with `$fetch.raw()` .

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