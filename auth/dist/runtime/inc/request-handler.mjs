import { ExpiredAuthSessionError } from "./expired-auth-session-error.mjs";
export class RequestHandler {
  constructor(scheme, http) {
    this.scheme = scheme;
    this.http = http;
    this.interceptor = null;
  }
  setHeader(token) {
    if (this.scheme.options.token && this.scheme.options.token.global) {
      this.http.setHeader(this.scheme.options.token.name, token);
    }
  }
  clearHeader() {
    if (this.scheme.options.token && this.scheme.options.token.global) {
      this.http.setHeader(this.scheme.options.token.name, false);
    }
  }
  initializeRequestInterceptor(refreshEndpoint) {
    this.interceptor = this.http.interceptors.request.use(async (config) => {
      if (this.scheme.options.token && !this.#needToken(config) || config.url === refreshEndpoint) {
        return config;
      }
      const {
        valid,
        tokenExpired,
        refreshTokenExpired,
        isRefreshable
      } = this.scheme.check(true);
      let isValid = valid;
      if (refreshTokenExpired) {
        this.scheme.reset();
        throw new ExpiredAuthSessionError();
      }
      if (tokenExpired) {
        if (!isRefreshable) {
          this.scheme.reset();
          throw new ExpiredAuthSessionError();
        }
        isValid = await this.scheme.refreshController.handleRefresh().then(() => true).catch(() => {
          this.scheme.reset();
          throw new ExpiredAuthSessionError();
        });
      }
      const token = this.scheme.token;
      if (!isValid) {
        if (token && !token.get() && this.#requestHasAuthorizationHeader(config)) {
          throw new ExpiredAuthSessionError();
        }
        return config;
      }
      return this.#getUpdatedRequestConfig(config, token ? token.get() : false);
    });
  }
  reset() {
    this.http.interceptors.request.eject(this.interceptor);
    this.interceptor = null;
  }
  #needToken(config) {
    const options = this.scheme.options;
    return options.token.global || Object.values(options.endpoints).some((endpoint) => typeof endpoint === "object" ? endpoint.url === config.url : endpoint === config.url);
  }
  #getUpdatedRequestConfig(config, token) {
    if (typeof token === "string") {
      config.headers[this.scheme.options.token.name] = token;
    }
    return config;
  }
  #requestHasAuthorizationHeader(config) {
    return !!config.headers[this.scheme.options.token.name];
    // return !!config.headers.common[this.scheme.options.token.name];
  }
}
