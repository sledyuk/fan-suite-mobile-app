import type { AuthorId } from '../api/types';

export interface Participant {
  id: AuthorId;
  name: string;
  handle: string;
  avatar?: number | string; // require() asset or remote URL; when absent <Avatar/> renders initials
}

/** The signed-in user of this app is the creator. */
/** Character art from the public Rick and Morty API (https://rickandmortyapi.com), cached on disk by expo-image. */
export const rmAvatar = (characterId: number) => `https://rickandmortyapi.com/api/character/avatar/${characterId}.jpeg`;

export const ME: Participant = {
  id: 'creator',
  name: 'Morty Smith',
  handle: '@morty_s',
  avatar: rmAvatar(2),
};

export const fan = (name: string, handle: string, avatar?: number | string): Participant => ({ id: 'fan', name, handle, avatar });
