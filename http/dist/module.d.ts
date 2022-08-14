import * as _nuxt_schema from '@nuxt/schema';
import { NuxtHttpInstance, ModuleOptions } from './types.js';
import 'ohmyfetch';

declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

declare module "#app" {
    interface NuxtApp {
        $http: NuxtHttpInstance;
    }
    interface NuxtOptions {
        http: NuxtHttpInstance;
    }
}

export { _default as default };
