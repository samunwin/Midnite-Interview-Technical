import {Hono} from 'hono'
import {setupRoutes} from "./router/router";

const app = new Hono();
setupRoutes(app);

export default app
