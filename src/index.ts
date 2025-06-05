import {Hono} from 'hono'
import {setupRoutes} from "./router/router";
import {FinanceRepository} from "./repositories/financeRepository";

const app = new Hono();
setupRoutes(app);

// TODO: temporary
FinanceRepository.getInstance();

export default app
