import { computed, isRef } from "vue";
import { useAsyncData } from "#imports";
export function useFetch(request, arg1, arg2) {
  const [opts, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _key = opts.key || autoKey;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useFetch] request is missing.");
  }
  const key = "$f" + _key;
  const _request = computed(() => {
    let r = request;
    if (typeof r === "function") {
      r = r();
    }
    return isRef(r) ? r.value : r;
  });
  const { server, lazy, default: defaultFn, transform, pick, watch, initialCache, ...fetchOptions } = opts;
  const _fetchOptions = {
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  };
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    initialCache,
    watch: [
      _request,
      ...watch || []
    ]
  };
  const asyncData = useAsyncData(key, () => {
    const method = opts && opts.method && ["get", "head", "delete", "post", "put", "patch"].includes(opts.method) ? opts.method : "get";
    return $fetch[method](_request.value, _fetchOptions);
  }, _asyncDataOptions);
  return asyncData;
}
export function useLazyFetch(request, arg1, arg2) {
  const [opts, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  return useFetch(request, {
    ...opts,
    lazy: true
  }, autoKey);
}
export function useHttp(request, arg1, arg2) {
  const [opts, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _key = opts.key || autoKey;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useHttp] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useHttp] request is missing.");
  }
  const key = "$h" + _key;
  const _request = computed(() => {
    let r = request;
    if (typeof r === "function") {
      r = r();
    }
    return isRef(r) ? r.value : r;
  });
  const { server, lazy, default: defaultFn, transform, pick, watch, initialCache, ...fetchOptions } = opts;
  const _fetchOptions = {
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  };
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    initialCache,
    watch: [
      _request,
      ...watch || []
    ]
  };
  const asyncData = useAsyncData(key, () => {
    const method = opts && opts.method && ["get", "head", "delete", "post", "put", "patch"].includes(opts.method) ? opts.method : "get";
    return $fetch[method](_request.value, _fetchOptions);
  }, _asyncDataOptions);
  return asyncData;
}
export function useLazyHttp(request, arg1, arg2) {
  const [opts, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  return useHttp(request, {
    ...opts,
    lazy: true
  }, autoKey);
}
