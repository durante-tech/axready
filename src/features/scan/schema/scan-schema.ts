import { z } from "zod";

export const scanInputSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  repo: z
    .string()
    .transform((val) =>
      val
        .replace(/^https?:\/\/github\.com\//, "")
        .replace(/\.git$/, "")
        .replace(/\/$/, "")
    )
    .pipe(
      z
        .string()
        .regex(/^[^/]+\/[^/]+$/, "Must be in owner/repo format")
        .optional()
        .or(z.literal(""))
    ),
});

export type ScanInput = z.infer<typeof scanInputSchema>;
