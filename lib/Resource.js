/**
 * Resource
 * @class
 */
export default class Resource {
    /**
     * API client
     * @type {ApiClient}
     * @private
     */
    #apiClient;

    /**
     * @param {ApiClient} apiClient - API client
     */
    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    /**
     * Method
     * @class
     * @static
     * @type {Method}
     * @property {string} method - Request method of this method
     * @property {string} path - Resource path that will be appended to API url, e.g. "check" or ":id"
     * @property {function(Object): string} encode - Function to encode input data
     * @property {ApiClient} apiClient - API client
     */
    static Method = class {
        /**
         * @typedef {Object} MethodSpec
         * @property {string} [method="GET"] - Request method of this method
         * @property {string} [path=""] - Resource path that will be appended to API url, e.g. "check" or ":id"
         * @property {function(Object):string} [encode] - Function to encode input data
         */
        /**
         * @param {MethodSpec} spec - Method spec
         * @param {ApiClient} apiClient - API client
         */
        constructor(spec, apiClient) {
            this.method = spec.method ?? "GET";
            this.path = spec.path ?? "";
            this.encode = spec.encode ?? (data => JSON.stringify(data));
            this.apiClient = apiClient;
        }

        /**
         * @typedef {Object} RequestData
         * @property {Object} [urlParams={}] - URL parameters
         * @property {Object} [body={}] - Request body data
         */

        /**
         * Raw data to RequestData
         * @param {Object} data - Raw data
         * @returns {RequestData}
         */
        rawToRequestData(data) {
            return {
                urlParams: Object.fromEntries(Object.entries(data).filter(([key, value]) => key.startsWith(":"))),
                body: Object.fromEntries(Object.entries(data).filter(([key, value]) => !key.startsWith(":"))),
            };
        }

        /**
         * Send request to this method
         *
         * @param {Object} data - Raw data to send
         * @returns {Promise<Object>}
         */
        async _send(data = {}) {
            return await this.apiClient.send(this, this.rawToRequestData(data));
        }
    }

    /**
     * Namespace
     * @class
     * @static
     * @type {Namespace}
     * @property {ApiClient} apiClient - API client
     */
    static Namespace = class {
        /**
         * Methods
         * @type {Object<string, Method>}
         * @private
         */
        #methods = {};

        /**
         * @param {string} path - Namespace path. All methods in this namespace will be prefixed with this path.
         * @param {ApiClient} apiClient - API client
         * @returns {Resource.Namespace}
         */
        constructor(path, apiClient) {
            this.path = path;
            this.apiClient = apiClient;
        }

        /**
         * Add method to this namespace
         * @param {string} name - Method name
         * @param {MethodSpec} spec - Method spec
         * @returns {Resource.Method}
         */
        addMethod(name, spec) {
            const method = new Resource.Method(spec, this.apiClient);
            method.path = `${this.path}/${spec.path}`;
            this.#methods[name] = method;
            return method;
        }

        /**
         * Get method
         * @param {string} name - Method name
         * @returns {Resource.Method}
         */
        getMethod(name) {
            return this.#methods[name];
        }
    }
}
