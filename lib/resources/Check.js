import Resource from "../Resource.js";

/**
 * Check
 * @class
 * @extends Resource.Namespace
 */
export default class Check extends Resource.Method {
    /**
     * @param {ApiClient} apiClient - API client
     */
    constructor(apiClient) {
        super({
            method: "GET",
            path: "check",
        }, apiClient);
    }

    /**
     * @returns {Promise<{ip: string, port: number, userAgent: string}>}
     */
    async send() {
        return await this._send();
    }
}