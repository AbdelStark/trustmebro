/**
 * What this file does
 * Renders a table of block header fields.
 */
import { truncateHex } from "@/lib/formatters";

export function BlockHeaderTable({ header }: { header: any }) {
  const rows: [string, string][] = [
    ["Hash", header.id],
    ["Height", String(header.height)],
    ["Version", String(header.version)],
    ["Time (UTC)", new Date(header.timestamp * 1000).toISOString()],
    ["Bits", String(header.bits)],
    ["Nonce", String(header.nonce)],
    ["Merkle Root", header.merkle_root],
    ["Prev Hash", header.previousblockhash ?? "-"],
    ["Tx Count", String(header.tx_count)],
    ["Size", String(header.size)],
    ["Weight", String(header.weight)],
  ];
  return (
    <div className="panel p-4">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-white/5 last:border-0">
              <td className="py-2 text-[var(--muted)]">{k}</td>
              <td className="py-2 font-mono break-all">{v.length > 40 ? truncateHex(v) : v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

