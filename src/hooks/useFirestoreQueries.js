import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, orderBy, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const staleTimes = {
  matches: 5 * 60 * 1000,
  predictions: 30 * 1000,
  users: 30 * 1000,
  clients: 5 * 60 * 1000,
};

export function useInvalidate() {
  const qc = useQueryClient();
  return (keys) => qc.invalidateQueries({ queryKey: keys });
}

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const q = query(collection(db, 'matches'), orderBy('date'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    staleTime: staleTimes.matches,
    gcTime: 30 * 60 * 1000,
  });
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'clients'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    staleTime: staleTimes.clients,
    gcTime: 30 * 60 * 1000,
  });
}

export function useClientDoc(clientId) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'clients', clientId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    enabled: !!clientId,
    staleTime: staleTimes.clients,
    gcTime: 30 * 60 * 1000,
  });
}

export function useUsersByClient(clientId) {
  return useQuery({
    queryKey: ['users', 'client', clientId],
    queryFn: async () => {
      const q = query(collection(db, 'users'), where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!clientId,
    staleTime: staleTimes.users,
    gcTime: 30 * 60 * 1000,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => a.displayName?.localeCompare(b.displayName) || 0);
      return data;
    },
    staleTime: staleTimes.users,
    gcTime: 30 * 60 * 1000,
  });
}

export function usePredictionsByUser(userId) {
  return useQuery({
    queryKey: ['predictions', 'user', userId],
    queryFn: async () => {
      const q = query(collection(db, 'predictions'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const preds = {};
      snapshot.forEach(d => { preds[d.data().matchId] = d.data(); });
      return preds;
    },
    enabled: !!userId,
    staleTime: staleTimes.predictions,
    gcTime: 30 * 60 * 1000,
  });
}

export function usePredictionsByClient(clientId) {
  return useQuery({
    queryKey: ['predictions', 'client', clientId],
    queryFn: async () => {
      const q = query(collection(db, 'predictions'), where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!clientId,
    staleTime: staleTimes.predictions,
    gcTime: 30 * 60 * 1000,
  });
}
