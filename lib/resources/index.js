import Auth from "./Auth.js";

/**
 *
 * @param apiClient
 * @returns {Resource.Namespace[]}
 */
export function resources(apiClient) {
    const r = [Auth];
    return r.map(resource => new resource(apiClient));
}
