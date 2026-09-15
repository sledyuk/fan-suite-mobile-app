import { MemoryKV } from '@/storage/MemoryKV';
import { NamespacedKV } from '@/storage/KeyValueStorage';

test('namespaces are isolated and clear() only wipes its own prefix', () => {
  const kv = new MemoryKV(); const a = new NamespacedKV(kv, 'client:'); const b = new NamespacedKV(kv, 'server:');
  a.set('x', '1'); b.set('x', '2');
  expect(a.get('x')).toBe('1'); expect(b.get('x')).toBe('2');
  a.clear();
  expect(a.get('x')).toBeNull(); expect(b.get('x')).toBe('2'); expect(b.keys()).toEqual(['x']);
});
