import { atom } from 'nanostores';
import { Subscription } from '../types';

export const $subscriptions = atom<Subscription[]>([]);

export const setSubscriptions = (subs: Subscription[]) => {
  $subscriptions.set(subs);
};

export const addSubscription = (sub: Subscription) => {
  const currentSubs = $subscriptions.get();
  $subscriptions.set([...currentSubs, sub]);
};

export const removeSubscription = (subId: string) => {
  const currentSubs = $subscriptions.get();
  $subscriptions.set(currentSubs.filter(sub => sub._id !== subId));
};

export const updateSubscription = (updatedSub: Subscription) => {
  const currentSubs = $subscriptions.get();
  $subscriptions.set(currentSubs.map(sub => 
    sub._id === updatedSub._id ? updatedSub : sub
  ));
}; 