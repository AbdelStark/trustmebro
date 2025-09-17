/**
 * What this file does
 * Zod schemas and types for Esplora-style block header responses.
 */
import { z } from "zod";

export const BlockHeaderSchema = z.object({
  id: z.string(),
  height: z.number().int(),
  version: z.number().int(),
  timestamp: z.number().int(),
  mediantime: z.number().int().optional(),
  bits: z.number().int(),
  nonce: z.number().int(),
  difficulty: z.number().optional(),
  merkle_root: z.string(),
  tx_count: z.number().int(),
  size: z.number().int(),
  weight: z.number().int(),
  previousblockhash: z.string().optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export type BlockHeader = z.infer<typeof BlockHeaderSchema>;

export const BlocksSchema = z.array(BlockHeaderSchema).min(1).max(10);
