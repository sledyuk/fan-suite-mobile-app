// Global Jest setup: native modules are replaced with small in-memory fakes.
jest.mock('expo-crypto', () => ({ randomUUID: () => `uuid_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}` }));
jest.mock('expo-sqlite/kv-store', () => {
  const m = new Map<string, string>();
  return { __esModule: true, default: {
    getItemSync: (k: string) => m.get(k) ?? null,
    setItemSync: (k: string, v: string) => { m.set(k, v); },
    removeItemSync: (k: string) => m.delete(k),
    getAllKeysSync: () => [...m.keys()],
    clearSync: () => { m.clear(); return true; },
  } };
});
