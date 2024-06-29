import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import firebase from '../utils/firebaseConfig';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
          router.push('/login');
        } else {
          setUser(user);
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }, []);

    if (loading) {
      return <p>Loading...</p>;
    }

    return <WrappedComponent {...props} user={user} />;
  };
};

export default withAuth;
