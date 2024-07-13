import React , { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, firestore } from '../../../firebaseConfig'; 
import { Menu as MenuIcon } from '@mui/icons-material'; 
import { useRouter } from 'next/router';
import {  collection, getDocs, query, where, } from 'firebase/firestore'; 
import styles from './AdminHeader.module.css';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Image from 'next/image';

const AdminHeader = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);

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

                if (userData && 'role' in userData) {
                  setIsAdmin(userData.role === 'Admin'); // Ensure the role check is case-sensitive
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
          setUser(null);
          setIsAdmin(false);
        }
      });
      return () => unsubscribe();
    }, []);


    const handleSignOut = () => {
      auth.signOut()
        .then(() => {
          console.log("Signed out successfully");
          setUser(null);
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    };

    const redirectToLogin = () => {
      const currentPath = router.asPath;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    };

    const handleMenuClickAway = () => {
      setMenuVisible(false);
  };

  const navigateToUsersAdmin = () => {
    router.push('/admin/users'); // Navigate to the User Admin page
    setMenuVisible(false); // Close the menu after navigation
  };

  const navigateToArticlesAdmin = () => {
    router.push('/admin'); // Navigate to the User Admin page
    setMenuVisible(false); // Close the menu after navigation
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <ClickAwayListener onClickAway={handleMenuClickAway}>
          <div className={styles.menu}>
            <button onClick={() => setMenuVisible(!menuVisible)} className="focus:outline-none">
              <MenuIcon className={styles.icon}/>
            </button>
        {menuVisible && (
          <div className="absolute left-0 mt-2 w-250 bg-white text-black rounded-md shadow-lg z-20">
              <button
                  onClick={navigateToUsersAdmin}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                  Users Admin
              </button>
              <button
                  onClick={navigateToArticlesAdmin}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                  Article Admin
              </button>
          </div>
        )} 
        </div>
        </ClickAwayListener>
        <span className={styles.title}>Admin Dashboard</span>
      </div>
      <div className={styles.center}>
        <Link href="/">
          <Image src="/logo.jpg" alt="Site Logo" width={40} height={40} className={styles.logo} />
        </Link>
      </div>
      <div className={styles.right}>
        {user ? (
          <>
            {isAdmin ? (
              <>
                <span>Signed in as Admin {user.displayName || user.email}</span>
                <button onClick={handleSignOut} className={styles.signOutButton}>Sign out</button>
              </>
            ) : (
              <span>You do not have admin privileges</span>
            )}
          </>
        ) : (
          <button onClick={redirectToLogin} className={styles.signInButton}>Sign in</button>
        )}
      </div>
      
    </header>
  );
};

export default AdminHeader;
