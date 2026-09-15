/** A FanSuite is a subscription tier; messaging one means every fan currently in it. */
export interface Suite {
  id: string;
  name: string;
  fanCount: number;
}

export const SUITES: Suite[] = [
  { id: 'all-access', name: 'All Access', fanCount: 240 },
  { id: 'vip', name: 'VIP Garage', fanCount: 32 },
  { id: 'free', name: 'Free tier', fanCount: 1180 },
];
