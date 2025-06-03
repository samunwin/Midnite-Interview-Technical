import {UserEvent, ZodUserEventSchema} from "../types";
import {Context} from "hono";
import {errorHandler} from "../router/error";
import {ZodSafeParseResult} from "zod/v4";
import * as eventService from "../services/eventService";

const eventHandler = async (c: Context) => {
  const body = await c.req.json();

  // Safely parse the JSON against our schema
  const result: ZodSafeParseResult<UserEvent> = ZodUserEventSchema.safeParse(body);
  if (!result.success) {
    const errorMsg: string = `caught zod validation error: ${result.error}`
    console.error(errorMsg);
    errorHandler(c, errorMsg, 400);
    return;
  }

  // Get the resulting UserEvent type out
  const userEvent: UserEvent = result.data;

  // Handle it with at the service layer
  eventService.handleUserEvent(userEvent);

  // Return whatever is necessary
  return c.json(userEvent);
};

export default eventHandler;