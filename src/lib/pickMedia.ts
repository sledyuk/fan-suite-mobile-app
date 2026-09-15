import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import type { Attachment } from '@/services/api/types';

/**
 * Opens the photo library for a photo or video and copies the pick into the
 * app's documents directory so the outbox item still resolves after a restart
 * (picker URIs live in a cache the OS may purge). Returns null on cancel.
 */
export async function pickMedia(): Promise<Attachment | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.8, videoMaxDuration: 60, allowsEditing: false });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  const kind: Attachment['kind'] = a.type === 'video' ? 'video' : 'image';
  let uri = a.uri;
  try {
    const ext = (a.fileName?.split('.').pop() ?? (kind === 'video' ? 'mov' : 'jpg')).toLowerCase();
    const dest = new File(Paths.document, `att_${Date.now()}.${ext}`);
    new File(a.uri).copy(dest);
    uri = dest.uri;
  } catch {
    /* keep the picker URI; still works for this session */
  }
  return { kind, uri, width: a.width, height: a.height, durationMs: a.duration ?? undefined };
}
