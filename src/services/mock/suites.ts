import type { Conversation } from './conversations';

export interface Suite {
  id: 'all-access' | 'vip' | 'free';
  name: string;
  fanIds: string[];
}

const NAMES: Record<Suite['id'], string> = { 'all-access': 'All Access', vip: 'VIP Garage', free: 'Free tier' };

export function suitesFor(conversations: ReadonlyArray<Conversation>): Suite[] {
  return (Object.keys(NAMES) as Suite['id'][]).map((id) => ({ id, name: NAMES[id], fanIds: conversations.filter((c) => c.suiteId === id).map((c) => c.id) }));
}
