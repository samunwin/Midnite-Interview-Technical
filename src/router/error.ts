import {Context} from "hono";
import {StatusCode} from "hono/dist/types/utils/http-status";

export const errorHandler = (c: Context, errorMsg: string, status: number) => {
    c.status(status as StatusCode);
    c.json({
        message: 'error',
        error: errorMsg,
    });
    return
};