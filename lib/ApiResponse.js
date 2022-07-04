/**
 * API response object
 * @class
 */
export default class ApiResponse {
    /**
     * Raw response data
     * @type {Response}
     * @private
     * @readonly
     */
    #res;

    /**
     * @param {Response} res - HTTP response
     * @param {Object} data - Response body data
     */
    constructor(res, data) {
        this.#res = res;
        Object.assign(this, data);
        Object.freeze(this);
    }

    /**
     * Get response object
     * @returns {Response}
     */
    get _res() {
        return this.#res;
    }

    /**
     * Get response ID
     * @returns {string}
     */
    get id() {
        return this._res.headers.get("X-Response-Id");
    }
}
