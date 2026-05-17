import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRIY5wwgatGCBucjkuIQJ13Dkynw4dmi0",
  authDomain: "quiniela2026-ccbf7.firebaseapp.com",
  projectId: "quiniela2026-ccbf7",
  storageBucket: "quiniela2026-ccbf7.firebasestorage.app",
  messagingSenderId: "954540603380",
  appId: "1:954540603380:web:7e471ee195e8a0edc5eba1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});