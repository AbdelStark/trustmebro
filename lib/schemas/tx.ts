/**
 * What this file does
 * Zod schemas and types for Esplora-style transaction responses (minimal subset).
 */
import { z } from "zod";

export const TxSchema = z.object({
  txid: z.string(),
  size: z.number().int(),
  weight: z.number().int(),
  fee: z.number().int().optional(),
});

export type Tx = z.infer<typeof TxSchema>;

export const TxsSchema = z.array(TxSchema);

