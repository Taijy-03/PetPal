// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBeTdMegWdAyEnj9dFsi4sHYECIM5G-II4",
  authDomain: "creat-a--account.firebaseapp.com",
  databaseURL: "https://creat-a--account-default-rtdb.firebaseio.com",
  projectId: "creat-a--account",
  storageBucket: "creat-a--account.appspot.com",
  messagingSenderId: "830716449710",
  appId: "1:830716449710:web:cb3f937b44d0712998ee3f",
  measurementId: "G-5G33R9PCX5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth with React Native persistence so auth state persists between sessions
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, db, auth, storage };
