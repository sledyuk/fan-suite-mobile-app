import { createContext, useContext, useEffect, useState } from 'react';
import { container } from '@/services/container';
import type { RootStore } from '@/stores/RootStore';

const Ctx = createContext<RootStore>(container.root);

/** Re-renders the tree with the fresh RootStore after `container.resetAll()`. */
export function StoresProvider({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = useState(container.root);
  useEffect(() => container.onReset(() => setRoot(container.root)), []);
  return <Ctx.Provider value={root}>{children}</Ctx.Provider>;
}

export const useStores = () => useContext(Ctx);
