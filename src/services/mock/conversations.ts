import { fan, type Participant } from './participants';

export interface FanProfile {
  bio: string;
  location: string;
  preferences?: string;
  suiteName: string;
  fanSince: string;   // display string
  rebill: boolean;
  lastOnline: string;
  lastResponse: string;
  totalSpent: number;
  avgTip: number;
  avgPpv: number;
  purchases: number;
  note?: string;
}

export interface Conversation {
  id: string;
  fan: Participant;
  profile: FanProfile;
  /** Seed for the deterministic thread behind this conversation. */
  seed: number;
  lastMessage: string;
  lastAt: number; // epoch ms
  unread: boolean;
  online: boolean;
}

const minutesAgo = (m: number, now: number) => now - m * 60_000;
const NOW = Date.UTC(2026, 8, 15, 11, 0, 0);

const profile = (p: Partial<FanProfile> & Pick<FanProfile, 'bio' | 'location'>): FanProfile => ({
  suiteName: 'All Access', fanSince: '12/02/2026', rebill: true, lastOnline: 'Today, 12:20', lastResponse: '12/10 2026, 12:20',
  totalSpent: 320, avgTip: 3.52, avgPpv: 30.12, purchases: 2, ...p,
});

// Parody fans in our own words. Morty has a PNG avatar; others fall back to initials.
export const CONVERSATIONS: Conversation[] = [
  { id: 'morty', fan: fan('Morty Smith', '@morty_s', require('@/assets/images/morty.png')), seed: 42,
    profile: profile({ bio: 'Fourteen, anxious, surprisingly loyal. Shows up to every stream, asks the questions nobody else dares to. Collects signed prints and loses them.', location: 'Seattle, WA, US', note: 'Send the print again. Registered mail this time.' }),
    lastMessage: 'Rick, are we streaming tonight?', lastAt: minutesAgo(0.5, NOW), unread: true, online: true },
  { id: 'summer', fan: fan('Summer Smith', '@summer_s'), seed: 7,
    profile: profile({ bio: 'Seventeen, runs a small following of her own. Watches for the drama, stays for the science. Tips when the stream goes long.', location: 'Seattle, WA, US', totalSpent: 120, avgTip: 5, purchases: 1 }),
    lastMessage: 'You: the car still needs a wash', lastAt: minutesAgo(12, NOW), unread: false, online: true },
  { id: 'birdperson', fan: fan('Bird Person', '@bird_person'), seed: 11,
    profile: profile({ bio: 'Old friend from another planet. Quiet, dependable, sends a gift on every anniversary he remembers, which is all of them.', location: 'Bird World', totalSpent: 980, avgTip: 20, avgPpv: 45, purchases: 9 }),
    lastMessage: 'In bird culture this is considered a reply.', lastAt: minutesAgo(48, NOW), unread: true, online: false },
  { id: 'squanchy', fan: fan('Squanchy', '@squanch'), seed: 13,
    profile: profile({ bio: 'Party animal. Literally. Joins late, leaves early, buys the loudest merch.', location: 'Squanch Planet', rebill: false, totalSpent: 60, avgTip: 2, purchases: 1 }),
    lastMessage: 'You: what does that word even mean', lastAt: minutesAgo(95, NOW), unread: false, online: false },
  { id: 'beth', fan: fan('Beth Smith', '@dr_beth'), seed: 17,
    profile: profile({ bio: 'Horse surgeon. Supports the channel out of a complicated mix of pride and guilt. Reads every post, comments on none.', location: 'Seattle, WA, US', totalSpent: 450, avgTip: 10, purchases: 4 }),
    lastMessage: 'The horse is fine. The client is not.', lastAt: minutesAgo(180, NOW), unread: false, online: true },
  { id: 'jerry', fan: fan('Jerry Smith', '@jerry_official'), seed: 19,
    profile: profile({ bio: 'Subscribed by accident, stayed on purpose. Asks about building a website once a week.', location: 'Seattle, WA, US', rebill: false, totalSpent: 9.99, avgTip: 0, avgPpv: 0, purchases: 0 }),
    lastMessage: 'You: no I do not need a website', lastAt: minutesAgo(400, NOW), unread: false, online: false },
  { id: 'unity', fan: fan('Unity', '@one_mind'), seed: 23,
    profile: profile({ bio: 'A hive mind with a lot of accounts and one opinion. Top spender three months running.', location: 'Everywhere', totalSpent: 2400, avgTip: 50, avgPpv: 80, purchases: 22 }),
    lastMessage: 'We all loved the stream. All of us.', lastAt: minutesAgo(700, NOW), unread: false, online: true },
  { id: 'meeseeks', fan: fan('Mr. Meeseeks', '@look_at_me'), seed: 29,
    profile: profile({ bio: 'Exists to complete one task. Currently: watch every archived stream. Progress: 40%.', location: 'Meeseeks Box', totalSpent: 30, avgTip: 1, purchases: 1 }),
    lastMessage: 'Task complete. Please stop asking.', lastAt: minutesAgo(1500, NOW), unread: false, online: false },
  { id: 'gearhead', fan: fan('Gearhead', '@gears_r_us'), seed: 31,
    profile: profile({ bio: 'Mechanic, self-described. Here for the garage builds. Sends parts instead of tips.', location: 'Gear World', totalSpent: 75, avgTip: 4, purchases: 2 }),
    lastMessage: 'You: thanks for the spare parts', lastAt: minutesAgo(3000, NOW), unread: false, online: false },
  { id: 'noob', fan: fan('Noob Noob', '@noob_noob'), seed: 37,
    profile: profile({ bio: 'Relentlessly positive. Comments "great job" on everything, means it every time.', location: 'Vindicators HQ', totalSpent: 15, avgTip: 1.5, purchases: 1 }),
    lastMessage: 'Great job on the merch drop. Really.', lastAt: minutesAgo(5000, NOW), unread: false, online: false },
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
