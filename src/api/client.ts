import { client } from "./gen/.kubb/client";

// Empty means same origin: in development Vite proxies /api to the backend, so
// the browser never makes a cross-origin request and the session cookie — which
// the API marks SameSite=Strict — keeps being sent.
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

client.setConfig({ baseURL: BASE_URL, options: { withCredentials: true } });

export { client };
