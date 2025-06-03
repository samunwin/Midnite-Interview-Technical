import {Handler} from "hono";
import eventHandler from "../controllers/event";

export type Route = {
    name: string;
    endpoint: string;
    methods: string[];
    controller: Handler;
};

export const routes: Route[] = [
    {
        name: 'event',
        endpoint: '/event',
        methods: ['post'],
        controller: eventHandler,
    },
];