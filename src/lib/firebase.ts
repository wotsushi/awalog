import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Deck, Result } from 'lib/result';

const firebaseConfig = {
  apiKey: 'AIzaSyACynGFpOnCLcKYEjlietudXTjr-FnRc6A',
  authDomain: 'awa-log.firebaseapp.com',
  projectId: 'awa-log',
  storageBucket: 'awa-log.appspot.com',
  messagingSenderId: '259054179430',
  appId: '1:259054179430:web:d3f2f15bfe0e79f49309a7',
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const collection = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const ref = doc(db, collection, '1103');

const auth = getAuth(app);

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  useEffect(() => {
    const accessDB = async () => {
      const doc = await getDoc(ref);
      const decksData = doc.data() as { decks: Deck[] };
      setDecks(decksData['decks']);
    };
    accessDB();
  }, []);

  return decks;
};

export const useResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  useEffect(() => {
    const accessDB = async () => {
      const resultsDoc = await getDoc(ref);
      const resultsData = resultsDoc.data() as { results: Result[] };
      setResults(resultsData['results']);
    };
    accessDB();
  }, []);

  return results;
};

export const useSaveResults = (thenFn?: () => void, catchFn?: () => void) =>
  useCallback(
    (result: Result) => {
      const accessDB = async () => {
        await updateDoc(ref, {
          results: arrayUnion(result),
        })
          .then(thenFn)
          .catch(catchFn);
      };
      accessDB();
    },
    [thenFn, catchFn]
  );

export const useUser = () => {
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const defer = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      }
      if (u === null) {
        setUser(undefined);
      }
    });
    return defer;
  }, []);
  return user;
};

export const useLogin = (failedLogin: () => void) => {
  const navigate = useNavigate();
  return useCallback(
    (email: string, password: string) => {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigate('/');
        })
        .catch(() => {
          failedLogin();
        });
    },
    [failedLogin, navigate]
  );
};

export const useLogout = () =>
  useCallback(() => {
    signOut(auth);
  }, []);
