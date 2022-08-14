import { defineNuxtModule, createResolver, addPluginTemplate, addAutoImport } from '@nuxt/kit';

const name = "@nuxtjs-custom/http";
const version = "1.1.9";

const CONFIG_KEY = "http";
const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: {},
  setup(_moduleOptions, nuxt) {
    const moduleOptions = {
      ..._moduleOptions,
      ...nuxt.options.runtimeConfig.public && nuxt.options.runtimeConfig.public[CONFIG_KEY]
    };
    const defaultPort = process.env.API_PORT || moduleOptions.port || process.env.PORT || process.env.npm_package_config_nuxt_port || nuxt.options.server && nuxt.options.server.port || 3e3;
    let defaultHost = process.env.API_HOST || moduleOptions.host || process.env.HOST || process.env.npm_package_config_nuxt_host || nuxt.options.server && nuxt.options.server.host || "localhost";
    if (defaultHost === "0.0.0.0") {
      defaultHost = "localhost";
    }
    const prefix = process.env.API_PREFIX || moduleOptions.prefix || "/";
    const https = Boolean(nuxt.options.server && nuxt.options.server.https);
    if (moduleOptions.baseUrl) {
      moduleOptions.baseURL = moduleOptions.baseUrl;
      delete moduleOptions.baseUrl;
    }
    if (moduleOptions.browserBaseUrl) {
      moduleOptions.browserBaseURL = moduleOptions.browserBaseUrl;
      delete moduleOptions.browserBaseUrl;
    }
    const options = {
      baseURL: `http://${defaultHost}:${defaultPort}${prefix}`,
      browserBaseURL: void 0,
      proxyHeaders: true,
      proxyHeadersIgnore: [
        "accept",
        "cf-connecting-ip",
        "cf-ray",
        "content-length",
        "content-md5",
        "content-type",
        "host",
        "if-modified-since",
        "if-none-match",
        "x-forwarded-host",
        "x-forwarded-port",
        "x-forwarded-proto"
      ],
      serverTimeout: 1e4,
      clientTimeout: 25e3,
      proxy: false,
      retry: false,
      undici: false,
      useConflict: false,
      https,
      headers: {},
      credentials: "omit",
      ...moduleOptions
    };
    if (process.env.API_URL) {
      options.baseURL = process.env.API_URL;
    }
    if (process.env.API_URL_BROWSER) {
      options.browserBaseURL = process.env.API_URL_BROWSER;
    }
    if (typeof options.browserBaseURL === "undefined") {
      options.browserBaseURL = options.proxy ? prefix : options.baseURL;
    }
    if (options.https === true) {
      const https2 = (s) => s.replace("http://", "https://");
      options.baseURL = https2(options.baseURL);
      options.browserBaseURL = https2(options.browserBaseURL);
    }
    const resolver = createResolver(import.meta.url);
    addPluginTemplate({
      src: resolver.resolve("runtime/templates/http.plugin.mjs"),
      filename: "http.plugin.mjs",
      options
    });
    process.env._HTTP_BASE_URL_ = options.baseURL;
    console.debug(`baseURL: ${options.baseURL}`);
    console.debug(`browserBaseURL: ${options.browserBaseURL}`);
    const runtime = resolver.resolve("runtime");
    nuxt.options.alias["#http/runtime"] = runtime;
    const composables = resolver.resolve("./runtime/composables");
    addAutoImport([
      { from: composables, name: options.useConflict ? "useFetch" : "useHttp" },
      { from: composables, name: options.useConflict ? "useLazyFetch" : "useLazyHttp" }
    ]);
  }
});

export { module as default };
