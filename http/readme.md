**Information**

This module is an adaptation of `https://github.com/Teranode/nuxt-module-alternatives/tree/master/%40nuxtjs-alt/http` 
to work with Nuxt $fetch and can be used with Nuxt 3 in the same way appropiate nuxt/axios and nuxt/http in nuxt 2.

At creation time Teranode's module dosen't supported $fetch, but only his adaptation of `@nuxtjs/http` for nuxt 3 (^rc.9).
Now you can use Teranode's, because it also use $fetch and have some emprovements.

This will only work with pinia and Nuxt 3 $fetch.


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