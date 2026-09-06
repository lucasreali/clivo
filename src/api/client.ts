import { client } from "./gen/.kubb/client";

// The API authenticates through a session cookie, so every request must carry credentials.
client.setConfig({ options: { withCredentials: true } });

export { client };
