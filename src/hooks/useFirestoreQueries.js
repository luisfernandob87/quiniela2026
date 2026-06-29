import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, orderBy, where, getDocs, getDoc, doc, getDocsFromCache, getDocFromCache } from 'firebase/firestore';
import { db } from '../firebase/config';

async function cachedQuery(q) {
  const cached = await getDocsFromCache(q).catch(() => null);
  if (cached && !cached.empty) return cached;
  return getDocs(q);
}

async function cachedDoc(ref) {
  const cached = await getDocFromCache(ref).catch(() => null);
  if (cached && cached.exists()) return cached;
  return getDoc(ref);
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (keys) => qc.invalidateQueries({ queryKey: keys });
}

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const q = query(collection(db, 'matches'), orderBy('date'));
      const snapshot = await cachedQuery(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  });
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const snapshot = await cachedQuery(collection(db, 'clients'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useClientDoc(clientId) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async () => {
      const ref = doc(db, 'clients', clientId);
      const snap = await cachedDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    enabled: !!clientId,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
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
    staleTime: 30 * 1000,
    gcTime: 60 * 60 * 1000,
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
    staleTime: 30 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const snapshot = await cachedQuery(collection(db, 'users'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  });
}

export function useAllPredictions() {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const snapshot = await cachedQuery(collection(db, 'predictions'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  });
}
