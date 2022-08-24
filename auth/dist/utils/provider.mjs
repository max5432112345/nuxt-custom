import { defu } from "defu";
import { join } from "pathe";
import { addServerHandler, addTemplate } from "@nuxt/kit";
export function assignDefaults(strategy, defaults) {
  Object.assign(strategy, defu(strategy, defaults));
}
export function addAuthorize(nuxt, strategy, useForms = false) {
  const clientSecret = strategy.clientSecret;
  const clientID = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  const audience = strategy.audience;
  delete strategy.clientSecret;
  const endpoint = `/_auth/oauth/${strategy.name}/authorize`;
  strategy.endpoints.token = endpoint;
  strategy.responseType = "code";
  addTemplate({
    filename: "auth-addAuthorize.ts",
    write: true,
    getContents: () => authorizeMiddlewareFile({
      endpoint,
      strategy,
      useForms,
      clientSecret,
      clientID,
      tokenEndpoint,
      audience
    })
  });
  addServerHandler({
    handler: join(nuxt.options.buildDir, "auth-addAuthorize.ts"),
    middleware: true
  });
}
export function initializePasswordGrantFlow(nuxt, strategy) {
  const clientSecret = strategy.clientSecret;
  const clientId = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  delete strategy.clientSecret;
  const endpoint = `/_auth/${strategy.name}/token`;
  strategy.endpoints.login.url = endpoint;
  strategy.endpoints.refresh.url = endpoint;
  addTemplate({
    filename: "auth-passwordGrant.ts",
    write: true,
    getContents: () => passwordGrantMiddlewareFile({
      endpoint,
      strategy,
      clientSecret,
      clientId,
      tokenEndpoint
    })
  });
  addServerHandler({
    handler: join(nuxt.options.buildDir, "auth-passwordGrant.ts"),
    middleware: true
  });
}
export function assignAbsoluteEndpoints(strategy) {
  const { url, endpoints } = strategy;
  if (endpoints) {
    for (const key of Object.keys(endpoints)) {
      const endpoint = endpoints[key];
      if (endpoint) {
        if (typeof endpoint === "object") {
          if (!endpoint.url || endpoint.url.startsWith(url)) {
            continue;
          }
          endpoints[key].url = url + endpoint.url;
        } else {
          if (endpoint.startsWith(url)) {
            continue;
          }
          endpoints[key] = url + endpoint;
        }
      }
    }
  }
}
export function authorizeMiddlewareFile(opt) {
  return `
import qs from 'querystring'
import bodyParser from 'body-parser'
import { defineEventHandler } from 'h3'

// Form data parser
const formMiddleware = bodyParser.urlencoded({ extended: true })
const options = ${JSON.stringify(opt)}

export default defineEventHandler(async (event) => {
    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        if (!event.req.url.includes(options.endpoint)) {
            return next()
        }
    
        if (event.req.method !== 'POST') {
            return next()
        }
    
        formMiddleware(event.req, event.res, () => {
            const {
                code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri = options.strategy.redirectUri,
                response_type: responseType = options.strategy.responseType,
                grant_type: grantType = options.strategy.grantType,
                refresh_token: refreshToken
            } = event.req.body
    
            // Grant type is authorization code, but code is not available
            if (grantType === 'authorization_code' && !code) {
                return next()
            }
    
            // Grant type is refresh token, but refresh token is not available
            if (grantType === 'refresh_token' && !refreshToken) {
                return next()
            }
    
            let data: qs.ParsedUrlQueryInput | string = {
                client_id: options.clientID,
                client_secret: options.clientSecret,
                refresh_token: refreshToken,
                grant_type: grantType,
                response_type: responseType,
                redirect_uri: redirectUri,
                audience: options.audience,
                code_verifier: codeVerifier,
                code
            }
    
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
    
            if (options.strategy.clientSecretTransport === 'authorization_header') {
                // @ts-ignore
                headers.Authorization = 'Basic ' + Buffer.from(options.clientID + ':' + options.clientSecret).toString('base64')
                // client_secret is transported in auth header
                delete data.client_secret
            }
    
            if (options.useForms) {
                data = qs.stringify(data)
                headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
            $http.$post({
              url: options.tokenEndpoint.url,
              body: data,
              headers,
              method: 'post'
            })
                .then((response) => {
                    event.res.end(JSON.stringify(response))
                })
                .catch((error) => {
                    event.res.statusCode = error.response.status
                    event.res.end(JSON.stringify(error.response.data))
                })
        })
    })
})
`;
}
export function passwordGrantMiddlewareFile(opt) {
  return `
import requrl from 'requrl'
import bodyParser from 'body-parser'
import { defineEventHandler } from 'h3'

// Form data parser
const formMiddleware = bodyParser.json()
const options = ${JSON.stringify(opt)}

export default defineEventHandler(async (event) => {
    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        if (!event.req.url.includes(options.endpoint)) {
            return next()
        }
    
        if (event.req.method !== 'POST') {
            return next()
        }
    
        formMiddleware(event.req, event.res, () => {
            const data = event.req.body
    
            // If \`grant_type\` is not defined, set default value
            if (!data.grant_type) {
                data.grant_type = options.strategy.grantType
            }
    
            // If \`client_id\` is not defined, set default value
            if (!data.client_id) {
                data.grant_type = options.clientId
            }
    
            // Grant type is password, but username or password is not available
            if (
                data.grant_type === 'password' &&
                (!data.username || !data.password)
            ) {
                return next(new Error('Invalid username or password'))
            }
    
            // Grant type is refresh token, but refresh token is not available
            if (data.grant_type === 'refresh_token' && !data.refresh_token) {
                return next(new Error('Refresh token not provided'))
            }
            $http.$post({
              url: options.tokenEndpoint.url,
              baseURL: requrl(event.req),
              body: {
                client_id: options.clientId,
                client_secret: options.clientSecret,
                ...data
              },
              headers: {
                Accept: 'application/json'
              },
              method: 'post'
            })
                .then((response) => {
                    event.res.end(JSON.stringify(response))
                })
                .catch((error) => {
                    event.res.statusCode = error.response.status
                    event.res.end(JSON.stringify(error.response.data))
                })
        })
    })
})
`;
}
