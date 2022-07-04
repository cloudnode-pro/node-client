import fetch from "node-fetch";
import ApiResponse from "./ApiResponse.js";
import {resources} from "./resources/index.js";
const packageJson = JSON.parse((await readFile("package.json")).toString());
const config = JSON.parse((await readFile("config.json")).toString());

/**
 * API client
 * @class
 */
export default class ApiClient {
    /**
     * API token
     * @type {string}
     * @private
     */
    #token;

    /**
     * @param {string} url - API url
     * @param {string} token - API token
     */
    constructor(url, token) {
        this.url = url;
        this.#token = token;
        this.addResourcesFromIndex(resources);
    }

    /**
     * Apply URL params (/url/:param/etc)
     * @param {string} url - URL
     * @param {Object} params - URL params
     * @returns {string}
     */
    applyUrlParams(url, params) {
        const urlParams = url.match(/:([^/]+?(?=\/|$))/g)?.map(param => param.slice(1)) ?? [];
        return Object.entries(params).filter(([key]) => urlParams.includes(key)).reduce((url, [key, value]) => url.replace(`:${key}`, `${value}`), url);
    }

    /**
     * Send request to API
     * @param {Resource.Method} method - Request method
     * @param {Object} data - Request data
     * @returns {Promise<ApiResponse>}
     */
    async send(method, data) {
        const url = this.url + this.applyUrlParams(method.path, data) + ["GET", "HEAD"].includes(method.method.toUpperCase()) ? "" : "?" + new URLSearchParams(data);
        const res = await fetch(url, {
            method: method.method,
            headers: {
                "Authorization": `Bearer ${this.#token}`,
                "User-Agent": config.userAgent + "/" + packageJson.version,
            },
            body: ["GET", "HEAD"].includes(method.method.toUpperCase()) ? undefined : method.encode(data.body),
        });
        const body = await res.json();
        return new ApiResponse(res, body);
    }

    /**
     * Add resources
     * @param {Resource.Namespace[]} resources - Resources
     * @returns {ApiClient}
     */
    addResources(resources) {
        Object.assign(this, resources.reduce((apiClient, resource) => {
            apiClient[resource.path] = resource;
            return apiClient;
        }, this));
        return this;
    }

    /**
     * Add resources from resources/index.js function
     * @param {function(ApiClient): Resource.Namespace[]} resources - Load resources function
     * @returns {ApiClient}
     */
    addResourcesFromIndex(resources) {
        this.addResources(resources(this));
        return this;
    }
}
