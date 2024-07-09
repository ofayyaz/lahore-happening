import styles from './Header.module.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SearchIcon from '@mui/icons-material/Search';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'next/router';
let lastScrollY = 0;

export default function Header() {
    const [searchVisible, setSearchVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY && window.scrollY > window.innerHeight) {
                setIsHeaderVisible(false);
            } else {
                setIsHeaderVisible(true);
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const redirectToLogin = () => {
        const currentPath = router.asPath;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    };

    const handleSignOut = () => {
        auth.signOut()
            .then(() => {
                console.log("Signed out successfully");
                setUser(null);
                // Optionally, redirect or show a message
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    };

    const handleMenuClickAway = () => {
        setMenuVisible(false);
    };

    const handleSearchClickAway = () => {
        setSearchVisible(false);
    };

    return (
        <>
        <div className={`${styles.header} ${isHeaderVisible ? styles.headerVisible : styles.headerHidden}`}>
            <div>
                <ClickAwayListener onClickAway={handleMenuClickAway}>
                    <div className="relative">
                        <button onClick={() => setMenuVisible(!menuVisible)} className="focus:outline-none">
                            <MenuIcon />
                        </button>
                        {menuVisible && (
                            <div className="absolute left-0 mt-2 w-250 bg-white text-black rounded-md shadow-lg z-20">
                                <button
                                    onClick={redirectToLogin}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                                >
                                    Sign in
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </ClickAwayListener>
            </div>
            <Image src="/logo.jpg" alt="Logo" width={60} height={40} />
            <ClickAwayListener onClickAway={handleSearchClickAway}>
                <div onClick={() => setSearchVisible(!searchVisible)}><SearchIcon/></div>
            </ClickAwayListener>
            <div >
                {!user ? (
                    <span className="cursor-pointer" onClick={redirectToLogin}>Sign in</span>
                ) : (
                    <div>
                    <p>Signed in as {user.displayName}</p>
                    <span className="cursor-pointer" onClick={handleSignOut}>Sign Out</span>
                    </div>
                )}
            </div>
            {searchVisible && <input type="text" placeholder="Search articles..." className={styles.searchBar} />}
            
        </div>
        <div className={styles.spacer}></div>
        </>
    );
}
