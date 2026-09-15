import type { AuthorId } from '../api/types';

export interface Participant {
  id: AuthorId;
  name: string;
  handle: string;
  avatar?: number; // require() asset id; when absent <Avatar/> renders initials
}

/** The signed-in user of this app is the creator. */
export const ME: Participant = {
  id: 'creator',
  name: 'Morty Smith',
  handle: '@morty_s',
  avatar: require('@/assets/images/morty.png'),
};

export const fan = (name: string, handle: string, avatar?: number): Participant => ({ id: 'fan', name, handle, avatar });
