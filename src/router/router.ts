import {Hono} from "hono";
import {Route, routes} from "./router.config";


export const setupRoutes = (app: Hono) => {
    routes.forEach((route: Route) => {
        route.methods.forEach((routeMethod: string) => {
            switch(routeMethod) {
                case 'get':
                    app.get(route.endpoint, route.controller);
                    break;
                case 'post':
                    app.post(route.endpoint, route.controller);
                    break;
            }
        });
    });
};