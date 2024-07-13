// pages/admin.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import { auth, firestore } from '../../../firebaseConfig' // Ensure the correct path
import { collection, getDocs, query as firestoreQuery, where } from 'firebase/firestore';
import User from '../../components/User';
import styles from './users.module.css';
import PrivateRoute from '../../components/PrivateRoute';

const GET_USERS = gql`
  query Users {
    users {
      id
      email
      displayName
      role
    }
  }
`;

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      email
      displayName
      role
    }
  }
`;

const UserAdmin = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

  const { data: gqlUserData, refetch } = useQuery(GET_USERS);

  const { data: searchData, refetch: searchRefetch } = useQuery(SEARCH_USERS, {
    variables: { query: searchQuery },
    skip: !searchQuery,
  });

    //const users = query ? searchData?.searchUsers : data?.users;

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setCurrentUser(user);
          try {
            const usersCollection = collection(firestore, 'users');
            const q = firestoreQuery(usersCollection, where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);
  
            if (!querySnapshot.empty) {
              querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData && 'role' in userData) {
                  setIsAdmin(userData.role === 'Admin');
                } else {
                  console.log('User data does not contain role field or is undefined');
                }
              });
            } else {
              console.log('No such document!');
            }
          } catch (error) {
            console.error('Error fetching user document:', error);
          }
        } else {
          router.push('/'); // Redirect if not authenticated
        }
      });
  
      return () => unsubscribe();
    }, [router]);

  useEffect(() => {
    if (!searchQuery && gqlUserData) {
      setUsers(gqlUserData.users);
    } else if (searchQuery && searchData) {
      setUsers(searchData.searchUsers);
    }
  }, [gqlUserData, searchData, searchQuery]);


  useEffect(() => {
    setUsers((prevUsers) => [...prevUsers].sort((a, b) => a.displayName.localeCompare(b.displayName)));
  }, [gqlUserData, searchData, searchQuery]);

    if (!currentUser) {
      return <p>Loading...</p>; // Show loading state or redirect message
    }
  
    if (!isAdmin) {
      return <p>You do not have admin privileges</p>; // Show no access message
    }

    return (
        <div>
          <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={() => searchRefetch({ query: searchQuery })}
          />
          <div className={styles.userList}>
              {users?.map((user) => (
              <User key={user.id} user={user} onUpdate={refetch} />
              ))}
          </div>
        </div>
    );
};

const UserAdminPage = () => (
  <PrivateRoute allowedRoles={['Admin']}>
    <UserAdmin />
  </PrivateRoute>
);

export default UserAdminPage;