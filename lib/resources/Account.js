import Resource from "../Resource.js";

/**
 * Account
 * @class
 * @extends Resource.Namespace
 */
export default class Account extends Resource.Namespace {
    /**
     * @param {ApiClient} apiClient - API client
     */
    constructor(apiClient) {
        super("account", apiClient);

        this.addMethod("retrieve", {
            method: "GET",
            path: "",
        });
        /**
         * @returns {Promise<{created: string, id: string, identity: ?IdentityObject}>}
         */
        this.retrieve = async function retrieve () {
            return await this.getMethod("retrieve")._send();
        }

        this.addMethod("identity", {
            method: "GET",
            path: "identity",
        });
        /**
         * @typedef {Object} IdentityObject
         * @property {string} country - alpha2 country code from when you registered
         * @property {string} email - current primary e-mail address
         * @property {string} name - full name
         * @property {string} username - unique username
         */
        /**
         * @returns {Promise<IdentityObject>}
         */
        this.identity = async function identity () {
            return await this.getMethod("identity")._send();
        }
    }



}
