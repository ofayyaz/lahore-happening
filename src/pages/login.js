
//import firebase from './firebase'; // Adjust the path to your Firebase setup
import Link from 'next/link';
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import styles from './LogIn.module.css';
import { useApolloClient, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';

const CREATE_USER = gql`
  mutation CreateUser($email: String!, $displayName: String!, $provider: String!) {
    createUser(email: $email, displayName: $displayName, provider: $provider) {
      id
      email
      displayName
      provider
    }
  }
`;

const CHECK_USER_EXISTENCE = gql`
  query CheckUserExistence($email: String!) {
    getUserByEmail(email: $email) {
      id
      email
      displayName
      provider
    }
  }
`;

const handleUser = async (user, provider, registerUser,client,router, redirect) => {
    const { email, displayName } = user;
    try {
        const { data } = await client.query({
          query: CHECK_USER_EXISTENCE,
          variables: { email },
        });
        if (!data.getUserByEmail) {
            await registerUser({ variables: { email, displayName, provider } });
        }
        // Handle successful registration (e.g., redirect, display message)
        router.push(redirect || '/');
      } catch (error) {
        console.error('Error registering user:', error.message);
      }
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerUser] = useMutation(CREATE_USER);
  const client = useApolloClient();
  const router = useRouter();
  const { redirect } = router.query;

  const handleLogin = async () => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await handleUser(user, 'email', registerUser, client, router, redirect);  
      // Handle successful login (e.g., redirect, display message)
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await handleUser(user, 'google', registerUser, client, router, redirect);
        // Handle successful login (e.g., redirect, display message)
        
    } catch (error) {
      console.error('Error logging in with Google:', error.message);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;
        await handleUser(user, 'facebook', registerUser, client, router, redirect);
    } catch (error) {
      console.error('Error logging in with Facebook:', error.message);
    }
  };

  

  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="border border-gray-300 p-5 w-72 mx-auto rounded-lg">
        <h1 className="text-center text-2xl mb-5">Sign In</h1>
        <div className="mb-4">
            <label className="block mb-1 font-bold" htmlFor="email">Email</label>
            <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
            />
        </div>
        <div className="mb-4">
            <label className="block mb-1 font-bold" htmlFor="password">Password</label>
            <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
            />
        </div>
        <div className="flex flex-col gap-2">
            <button onClick={handleLogin} className="p-2 bg-blue-600 text-white rounded cursor-pointer text-center hover:bg-blue-700">Login</button>
            <button onClick={handleGoogleLogin} className="p-2 bg-red-600 text-white rounded cursor-pointer text-center hover:bg-red-700">Log in with Google</button>
            <button onClick={handleFacebookLogin} className="p-2 bg-blue-800 text-white rounded cursor-pointer text-center hover:bg-blue-900">Log in with Facebook</button>
        </div>
        <p className="text-center mt-5">
            Not signed up? <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
        </div>
    </div>
  );
};
  
export default LoginPage;
