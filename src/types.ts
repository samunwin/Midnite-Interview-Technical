import { z } from "zod/v4";

export type UserEvent = {
    type: string;
    amount: number;
    user_id: number;
    t: number;
};

export const ZodUserEventSchema = z.object({
    type: z.union([z.string('deposit'), z.string('withdraw')]),
    amount: z.preprocess(
        (value: any): any => {
            if (typeof value === "string") {
                const parsed = Number(value);
                return isNaN(parsed) ? value : parsed;
            }
            return value;
        },
        z.number()
    ),
    user_id: z.number(),
    t: z.number(),
});

export type UserEventResponse = {
    alert: boolean;
    alert_codes: number[];
    user_id: number;
};