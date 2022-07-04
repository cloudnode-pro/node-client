import Auth from "./Auth.js";

/**
 * Load resources
 * @param apiClient
 * @returns {(Resource.Namespace|Resource.Method)[]}
 */
export function resources(apiClient) {
    const r = [Auth];
    return r.map(resource => new resource(apiClient));
}
