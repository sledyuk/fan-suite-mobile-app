import { fan, rmAvatar, type Participant } from './participants';

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

/** Delivery state of the creator's own last message (only meaningful when `from === 'creator'`). */
export type OutgoingStatus = 'sending' | 'delivered' | 'seen' | 'failed';

export interface LastMessage {
  text: string;
  from: 'fan' | 'creator';
  at: number; // epoch ms
  status?: OutgoingStatus;
}

export interface Conversation {
  id: string;
  fan: Participant;
  profile: FanProfile;
  /** Seed for the deterministic thread behind this conversation. */
  seed: number;
  last: LastMessage;
  /** Fan messages the creator has not opened yet. */
  unreadCount: number;
  online: boolean;
  pinned?: boolean;
  muted?: boolean;
  /** FanSuite (tier) this fan is subscribed to. */
  suiteId: 'all-access' | 'vip' | 'free';
}

const NOW = Date.UTC(2026, 8, 15, 11, 0, 0);
const minutesAgo = (m: number) => NOW - m * 60_000;
const fromFan = (text: string, minutes: number): LastMessage => ({ text, from: 'fan', at: minutesAgo(minutes) });
const fromMe = (text: string, minutes: number, status: OutgoingStatus): LastMessage => ({ text, from: 'creator', at: minutesAgo(minutes), status });

const profile = (p: Partial<FanProfile> & Pick<FanProfile, 'bio' | 'location'>): FanProfile => ({
  suiteName: 'All Access', fanSince: '12/02/2026', rebill: true, lastOnline: 'Today, 12:20', lastResponse: '12/10 2026, 12:20',
  totalSpent: 320, avgTip: 3.52, avgPpv: 30.12, purchases: 2, ...p,
});

// Parody fans in our own words. Avatars come from the Rick and Morty API; <Avatar/> falls back to initials while loading or offline.
export const CONVERSATIONS: Conversation[] = [
  { id: 'rick', fan: fan('Rick Sanchez', '@rickc137', rmAvatar(1), true), seed: 42, suiteId: 'vip',
    profile: profile({ bio: 'Scientist, grandfather, chaos agent. Subscribed "for research". Sends gifts at 3am with no explanation and expects a reply by 3:05.', location: 'Dimension C-137', note: 'Do not let him near the garage stream setup again.', totalSpent: 1250, avgTip: 25, avgPpv: 60, purchases: 11 }),
    last: fromFan('It is not a password. It is a riddle. Also no.', 0.5), unreadCount: 2, online: true },
  { id: 'summer', fan: fan('Summer Smith', '@summer_s', rmAvatar(3)), seed: 7, suiteId: 'all-access',
    profile: profile({ bio: 'Seventeen, runs a small following of her own. Watches for the drama, stays for the science. Tips when the stream goes long.', location: 'Seattle, WA, US', totalSpent: 120, avgTip: 5, purchases: 1 }),
    last: fromMe('the car still needs a wash', 12, 'seen'), unreadCount: 0, online: true },
  { id: 'birdperson', fan: fan('Birdperson', '@birdperson', rmAvatar(47), true), seed: 11, suiteId: 'vip',
    profile: profile({ bio: 'Old friend from another planet. Quiet, dependable, sends a gift on every anniversary he remembers, which is all of them.', location: 'Bird World', totalSpent: 980, avgTip: 20, avgPpv: 45, purchases: 9 }),
    last: fromFan('In bird culture this is considered a reply.', 48), unreadCount: 1, online: false },
  { id: 'squanchy', fan: fan('Squanchy', '@squanch', rmAvatar(331)), seed: 13, suiteId: 'free',
    profile: profile({ bio: 'Party animal. Literally. Joins late, leaves early, buys the loudest merch.', location: 'Squanch Planet', rebill: false, totalSpent: 60, avgTip: 2, purchases: 1 }),
    last: fromMe('what does that word even mean', 95, 'failed'), unreadCount: 0, online: false },
  { id: 'beth', fan: fan('Beth Smith', '@dr_beth', rmAvatar(4), true), seed: 17, suiteId: 'all-access',
    profile: profile({ bio: 'Horse surgeon. Supports the channel out of a complicated mix of pride and guilt. Reads every post, comments on none.', location: 'Seattle, WA, US', totalSpent: 450, avgTip: 10, purchases: 4 }),
    last: fromFan('The horse is fine. The client is not.', 180), unreadCount: 0, online: true },
  { id: 'jerry', fan: fan('Jerry Smith', '@jerry_official', rmAvatar(5)), seed: 19, suiteId: 'free',
    profile: profile({ bio: 'Subscribed by accident, stayed on purpose. Asks about building a website once a week.', location: 'Seattle, WA, US', rebill: false, totalSpent: 9.99, avgTip: 0, avgPpv: 0, purchases: 0 }),
    last: fromMe('no I do not need a website', 400, 'delivered'), unreadCount: 0, online: false },
  { id: 'unity', fan: fan('Unity', '@one_mind', rmAvatar(372), true), seed: 23, suiteId: 'vip',
    profile: profile({ bio: 'A hive mind with a lot of accounts and one opinion. Top spender three months running.', location: 'Everywhere', totalSpent: 2400, avgTip: 50, avgPpv: 80, purchases: 22 }),
    last: fromFan('We all loved the stream. All of us.', 700), unreadCount: 0, online: true },
  { id: 'meeseeks', fan: fan('Mr. Meeseeks', '@look_at_me', rmAvatar(242)), seed: 29, suiteId: 'all-access',
    profile: profile({ bio: 'Exists to complete one task. Currently: watch every archived stream. Progress: 40%.', location: 'Meeseeks Box', totalSpent: 30, avgTip: 1, purchases: 1 }),
    last: fromFan('Task complete. Please stop asking.', 1500), unreadCount: 0, online: false },
  { id: 'gearhead', fan: fan('Revolio Clockberg Jr.', '@gearhead', rmAvatar(282)), seed: 31, suiteId: 'free',
    profile: profile({ bio: 'Mechanic, self-described. Here for the garage builds. Sends parts instead of tips.', location: 'Gear World', totalSpent: 75, avgTip: 4, purchases: 2 }),
    last: fromMe('thanks for the spare parts', 3000, 'sending'), unreadCount: 0, online: false },
  { id: 'noob', fan: fan('Noob-Noob', '@noob_noob', rmAvatar(252)), seed: 37, suiteId: 'all-access',
    profile: profile({ bio: 'Relentlessly positive. Comments "great job" on everything, means it every time.', location: 'Vindicators HQ', totalSpent: 15, avgTip: 1.5, purchases: 1 }),
    last: fromFan('Great job on the merch drop. Really.', 5000), unreadCount: 0, online: false },
];

export function findConversation(id: string | undefined): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}

/** Fixed "now" for the fixture so list stamps are stable in screenshots and tests. */
export const FIXTURE_NOW = NOW;

