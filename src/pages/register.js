//import firebase from './firebase'; // Adjust the path to your Firebase setup
import { useState } from 'react';
import { createUserWithEmailAndPassword,updateProfile } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useMutation, gql } from '@apollo/client';
import Link from 'next/link';

const REGISTER_USER = gql`
  mutation CreateUser($email: String!, $displayName: String!, $provider: String!) {
    createUser(email: $email, displayName: $displayName, provider: $provider) {
      id
      email
      displayName
      provider
    }
  }
`;

const handleUser = async (email, displayName, provider, registerUser) => {
  await registerUser({ variables: { email, displayName, provider } });
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [provider, setProvider] = useState('email');
  const [registerUser, { data, loading, error }] = useMutation(REGISTER_USER);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User:", user)
      
      await updateProfile(user, { displayName });
      
      await handleUser(email, displayName, provider, registerUser);
      setSuccessMessage('User registered successfully!'); // Set success message
  
    } catch (error) {
      console.error('Error registering:', error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="border border-gray-300 p-5 w-72 mx-auto rounded-lg">
        <h1 className="text-center text-2xl mb-5">Register</h1>
        <div className="mb-4">
          <label className="block mb-1 font-bold" htmlFor="email">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
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
          <button onClick={handleRegister} className="p-2 bg-blue-600 text-white rounded cursor-pointer text-center hover:bg-blue-700">
            Register
          </button>
        </div>
        {loading && <p className="text-center mt-5">Loading...</p>}
        {error && <p className="text-center mt-5 text-red-600">Error: {error.message}</p>}
        {data && <p className="text-center mt-5 text-green-600">Registered successfully!</p>}
        <p className="text-center mt-5">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
  };
  
  export default RegisterPage;