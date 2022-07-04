import Resource from "../Resource.js";

/**
 * Auth
 * @class
 * @extends Resource.Namespace
 */
export default class Auth extends Resource.Namespace {
    /**
     * @param {ApiClient} apiClient - API client
     */
    constructor(apiClient) {
        super("auth", apiClient);

        this.addMethod("check", {
            method: "GET",
            path: "check",
        });
        /**
         * @param {number} test
         * @returns {Promise<{authenticated: boolean, via: "token"|"session", token: ?Object, session: ?Object}>}
         */
        this.check = async (test) => {
            return this.getMethod("check")._send();
        }
    }
}
