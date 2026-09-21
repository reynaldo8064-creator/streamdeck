import type {
  Category as BackendCategory,
  Channel as BackendChannel,
  ChannelDetail as BackendChannelDetail,
  Program as BackendProgram,
} from "@/backend";
import { Category, ChannelSort } from "@/backend";

export { Category, ChannelSort };
export type {
  BackendCategory,
  BackendChannel,
  BackendChannelDetail,
  BackendProgram,
};

/** A broadcast channel in the StreamDeck catalog. */
export type Channel = BackendChannel;

/** A single scheduled program on a channel. */
export type Program = BackendProgram;

/** A channel together with its now-playing and up-next programs. */
export type ChannelDetail = BackendChannelDetail;

/** Category filter value: a concrete category or the "all channels" sentinel. */
export type CategoryFilter = Category | "all";

/** Sort order for channel listings. */
export type ChannelSortOrder = "name" | "popularity";

/**
 * Convert a Motoko nanosecond timestamp into a JavaScript Date.
 * Returns null when the value cannot be represented as a valid date.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a short local time, e.g. "21:30". */
export function formatTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "--:--";
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format a backend timestamp as a short local date, e.g. "21 sep". */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** Zero-padded channel number derived from the channel id, e.g. "042". */
export function channelNumber(id: bigint): string {
  return id.toString().padStart(3, "0");
}

/** Human-readable duration between two backend timestamps, e.g. "45 min". */
export function formatDuration(startTime: bigint, endTime: bigint): string {
  const minutes = Number((endTime - startTime) / 60_000_000_000n);
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
