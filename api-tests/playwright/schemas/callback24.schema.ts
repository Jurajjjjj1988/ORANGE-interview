import { z } from "zod";

export const Callback24Schema = z.object({
  status: z.boolean(),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  company_name: z.string(),
  widget_color: z.string().optional(),
  current_time: z.string().datetime({ offset: true }).optional(),
});

export type Callback24Response = z.infer<typeof Callback24Schema>;
