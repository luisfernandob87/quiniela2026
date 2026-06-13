import { useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

export default function RealtimeProvider({ children }) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUser) return;

    const unsubs = [];

    const matchesQ = query(collection(db, 'matches'), orderBy('date'));
    unsubs.push(onSnapshot(matchesQ, (snap) => {
      queryClient.setQueryData(['matches'], snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    if (currentUser.clientId) {
      const clientDocRef = doc(db, 'clients', currentUser.clientId);
      unsubs.push(onSnapshot(clientDocRef, (snap) => {
        queryClient.setQueryData(['clients', currentUser.clientId],
          snap.exists() ? { id: snap.id, ...snap.data() } : null);
      }));

      const predQ = query(collection(db, 'predictions'), where('clientId', '==', currentUser.clientId));
      unsubs.push(onSnapshot(predQ, (snap) => {
        queryClient.setQueryData(['predictions', 'client', currentUser.clientId], snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));

      const usersQ = query(collection(db, 'users'), where('clientId', '==', currentUser.clientId));
      unsubs.push(onSnapshot(usersQ, (snap) => {
        queryClient.setQueryData(['users', 'client', currentUser.clientId], snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));
    }

    return () => unsubs.forEach(u => u());
  }, [currentUser, queryClient]);

  return children;
}
