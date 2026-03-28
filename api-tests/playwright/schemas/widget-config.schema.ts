import { z } from "zod";

export const WidgetConfigSchema = z.object({
  webchatURL: z.string().url().startsWith("https://"),
  statisticURL1: z.string(),
  statisticTimeout1: z.number().positive().optional(),
  userData: z.object({
    alcs_ChatBot: z.enum(["true", "false"]),
  }),
});

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
