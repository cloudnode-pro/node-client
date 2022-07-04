import fetch from "node-fetch";
import ApiResponse from "./ApiResponse.js";
import {resources} from "./resources/index.js";
import Resource from "./Resource.js";
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
     * API base url
     * @type {URL}
     * @private
     */
    #url;

    /**
     * @param {string|URL} url - API url
     * @param {string} token - API token
     */
    constructor(token, url) {
        if (!token?.startsWith("token_")) console.warn("The specified token does not start with 'token_'. It is likely invalid.");
        this.#token = token;
        this.#url = url instanceof URL ? url : new URL(url);
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
        const url = this.#url + this.applyUrlParams(method.path, data) + (["GET", "HEAD"].includes(method.method.toUpperCase()) && Object.keys(data.body) > 0 ? "?" + new URLSearchParams(data.body) : "");
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
     * @param {(Resource.Namespace|Resource.Method)[]} resources - Resources
     * @returns {ApiClient}
     */
    addResources(resources) {
        Object.assign(this, resources.reduce((apiClient, resource) => {
            if (resource instanceof Resource.Method)
                this.addMethod(resource);
            else apiClient[resource.path] = resource;
            return apiClient;
        }, this));
        return this;
    }

    /**
     * Add method
     * @param {Resource.Method} method - Method
     * @returns {ApiClient}
     */
    addMethod(method) {
        this[method.path] = method.send.bind(method);
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
