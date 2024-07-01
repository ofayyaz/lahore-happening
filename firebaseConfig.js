import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpmRlDwPI162Ej5xCWiEYXXiqbKsE0O1o",
  authDomain: "lahore-happening.firebaseapp.com",
  projectId: "lahore-happening",
  storageBucket: "lahore-happening.appspot.com",
  messagingSenderId:"552871698197",
  appId: "1:552871698197:web:b66c473b12dbfe94eed31c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export { app, auth };
