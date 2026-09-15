import { CONVERSATIONS } from './conversations';

/** A FanSuite is a subscription tier. Messaging one means every fan currently in it. */
export interface Suite {
  id: 'all-access' | 'vip' | 'free';
  name: string;
  fanIds: string[];
}

const tier = (id: Suite['id'], name: string): Suite => ({ id, name, fanIds: CONVERSATIONS.filter((c) => c.suiteId === id).map((c) => c.id) });

export const SUITES: Suite[] = [tier('all-access', 'All Access'), tier('vip', 'VIP Garage'), tier('free', 'Free tier')];
