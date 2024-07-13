// components/PrivateRoute.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';



const PrivateRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Query to find the document by UID field
          const usersCollection = collection(firestore, 'users');
          const q = query(usersCollection, where('uid', '==', firebaseUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              console.log('User data:', userData); // Log the user data

              if (userData && 'role' in userData) {
                console.log('Role field found:', userData.role); // Log the role field
                if (allowedRoles.includes(userData.role)) {
                  setIsAuthorized(true);
                } else {
                  setIsAuthorized(false);
                  router.push('/'); // Redirect if not authorized
                }
              } else {
                console.log('User data does not contain role field or is undefined');
                setIsAuthorized(false);
                router.push('/'); // Redirect if role field is missing or undefined
              }
            });
          } else {
            console.log('No such document!');
            setIsAuthorized(false);
            router.push('/'); // Redirect if no user document found
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setIsAuthorized(false);
          router.push('/'); // Redirect on error
        }
      } else {
        router.push('/login'); // Redirect if not authenticated
      }
    });

    return () => unsubscribe();
  }, [allowedRoles, router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return isAuthorized ? children : <p>You do not have access to this page</p>;
};

export default PrivateRoute;
