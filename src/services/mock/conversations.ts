import type { Participant } from './creator';
import { CREATOR } from './creator';

export interface Conversation {
  id: string;
  creator: Participant;
  /** Seed for the deterministic thread behind this conversation. */
  seed: number;
  lastMessage: string;
  lastAt: number; // epoch ms
  unread: boolean;
  online: boolean;
}

const minutesAgo = (m: number, now: number) => now - m * 60_000;
const NOW = Date.UTC(2026, 8, 15, 11, 0, 0);

// Parody creators in our own words. Only the first has a PNG avatar; others
// fall back to initials rendered by <Avatar/>.
const creator = (name: string, handle: string): Participant => ({ id: 'creator', name, handle });

export const CONVERSATIONS: Conversation[] = [
  { id: 'rick', creator: CREATOR, seed: 42, lastMessage: 'It is not a password. It is a riddle. Also no.', lastAt: minutesAgo(0.5, NOW), unread: true, online: true },
  { id: 'summer', creator: creator('Summer Smith', '@summer_s'), seed: 7, lastMessage: 'You: the car still needs a wash', lastAt: minutesAgo(12, NOW), unread: false, online: true },
  { id: 'birdperson', creator: creator('Bird Person', '@bird_person'), seed: 11, lastMessage: 'In bird culture this is considered a reply.', lastAt: minutesAgo(48, NOW), unread: true, online: false },
  { id: 'squanchy', creator: creator('Squanchy', '@squanch'), seed: 13, lastMessage: 'You: what does that word even mean', lastAt: minutesAgo(95, NOW), unread: false, online: false },
  { id: 'beth', creator: creator('Beth Smith', '@dr_beth'), seed: 17, lastMessage: 'The horse is fine. The client is not.', lastAt: minutesAgo(180, NOW), unread: false, online: true },
  { id: 'jerry', creator: creator('Jerry Smith', '@jerry_official'), seed: 19, lastMessage: 'You: no I do not need a website', lastAt: minutesAgo(400, NOW), unread: false, online: false },
  { id: 'unity', creator: creator('Unity', '@one_mind'), seed: 23, lastMessage: 'We all loved the stream. All of us.', lastAt: minutesAgo(700, NOW), unread: false, online: true },
  { id: 'meeseeks', creator: creator('Mr. Meeseeks', '@look_at_me'), seed: 29, lastMessage: 'Task complete. Please stop asking.', lastAt: minutesAgo(1500, NOW), unread: false, online: false },
  { id: 'gearhead', creator: creator('Gearhead', '@gears_r_us'), seed: 31, lastMessage: 'You: thanks for the spare parts', lastAt: minutesAgo(3000, NOW), unread: false, online: false },
  { id: 'noob', creator: creator('Noob Noob', '@noob_noob'), seed: 37, lastMessage: 'Great job on the merch drop. Really.', lastAt: minutesAgo(5000, NOW), unread: false, online: false },
];

export function findConversation(id: string | undefined): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}

/** "30s ago", "12m ago", "3h ago", "2d ago" — matches the mockup's compact style. */
export function relativeTime(ts: number, now = NOW): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
