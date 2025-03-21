import { atom } from 'nanostores';

interface User {
  _id: string;
}

export const $user = atom<User | null>(null);

export function setUser(user: User | null) {
  $user.set(user);
} 