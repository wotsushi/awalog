import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { arrayUnion, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Deck, Result } from "result";

const firebaseConfig = {
  apiKey: "AIzaSyACynGFpOnCLcKYEjlietudXTjr-FnRc6A",
  authDomain: "awa-log.firebaseapp.com",
  projectId: "awa-log",
  storageBucket: "awa-log.appspot.com",
  messagingSenderId: "259054179430",
  appId: "1:259054179430:web:d3f2f15bfe0e79f49309a7",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const decksRef = doc(db, "1103", "decks");
const resultsRef = doc(db, "1103", "results");

const auth = getAuth(app);

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  useEffect(() => {
    const accessDB = async () => {
      const doc = await getDoc(decksRef);
      const decksData = doc.data() as { data: Deck[] };
      setDecks(decksData["data"]);
    };
    accessDB();
  }, []);

  return decks;
}

export const useResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  useEffect(() => {
    const accessDB = async () => {
      const resultsDoc = await getDoc(resultsRef);
      const resultsData = resultsDoc.data() as { data: Result[] };
      setResults(resultsData["data"]);
    };
    accessDB();
  }, []);

  return results;
}

export const useSaveResults = () => useCallback((result: Result) => {
    const accessDB = async () => {
      await updateDoc(resultsRef, {
        data: arrayUnion(result),
      });
    };
    accessDB();
}, []);

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
}

export const useLogin = (failedLogin: () => void) => {
  const navigate = useNavigate();
  return useCallback((email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        failedLogin();
      })}, [failedLogin, navigate]);
}

export const useLogout = () => useCallback(() => {
  signOut(auth)}, [])
