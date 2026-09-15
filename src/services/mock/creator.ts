import type { AuthorId } from '../api/types';

export interface Participant {
  id: AuthorId;
  name: string;
  handle: string;
  avatar?: number; // require() asset id; when absent <Avatar/> renders initials
}

export const CREATOR: Participant = {
  id: 'creator',
  name: 'Rick Sanchez',
  handle: '@rickc137',
  avatar: require('@/assets/images/rick.png'),
};

export const FAN: Participant = {
  id: 'fan',
  name: 'Morty Smith',
  handle: '@morty_s',
  avatar: require('@/assets/images/morty.png'),
};
