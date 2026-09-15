import type { AuthorId } from '../api/types';

export interface Participant {
  id: AuthorId;
  name: string;
  handle: string;
  avatar?: number | string;
  verified?: boolean;
}

export const rmAvatar = (characterId: number) => `https://rickandmortyapi.com/api/character/avatar/${characterId}.jpeg`;

export const ME: Participant = {
  id: 'creator',
  name: 'Morty Smith',
  handle: '@morty_s',
  avatar: rmAvatar(2),
};

export const fan = (name: string, handle: string, avatar?: number | string, verified = false): Participant => ({ id: 'fan', name, handle, avatar, verified });
