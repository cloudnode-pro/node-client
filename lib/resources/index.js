import Account from "./Account.js";
import Auth from "./Auth.js";
import Check from "./Check.js";

/**
 * Load resources
 * @param apiClient
 * @returns {(Resource.Namespace|Resource.Method)[]}
 */
export function resources(apiClient) {
    const r = [Account, Auth, Check];
    return r.map(resource => new resource(apiClient));
}
