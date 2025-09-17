/**
 * What this file does
 * Displays a grid of BlockCard components.
 */
import { BlockCard } from "./BlockCard";

export async function BlockGrid({ blocks }: { blocks: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {blocks.map((b) => (
        <BlockCard key={b.id} block={b} />
      ))}
    </div>
  );
}

