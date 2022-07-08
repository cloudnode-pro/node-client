import Check from "./Check.js";
import Account from "./Account.js";
import Auth from "./Auth.js";

/**
 * Load resources
 * @param apiClient
 * @returns {(Resource.Namespace|Resource.Method)[]}
 */
export function resources(apiClient) {
    const r = [Check, Account, Auth];
    return r.map(resource => new resource(apiClient));
}
