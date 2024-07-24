import styles from './Header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SearchIcon from '@mui/icons-material/Search';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'next/router';
import { GET_CATEGORIES } from '../../graphql/queries';
let lastScrollY = 0;

export default function Header() {
    const [searchVisible, setSearchVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const { data: categoriesData, loading, error } = useQuery(GET_CATEGORIES);

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

    const handleMenuButtonClick = () => {
        setTimeout(() => {
            setMenuVisible(false);
        }, 300);
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
                        <div className={styles.menuPanel}>
                            {categoriesData.allCategories.map(category => (
                                <Link key={category.id} href={`/category/${category.id}`}>
                                <button className={styles.menuButton} onClick={handleMenuButtonClick}>{category.name}</button>
                                </Link>
                            ))}
                            <button onClick={redirectToLogin} className={styles.menuButtonSign}>Sign in</button>
                            <button onClick={handleSignOut} className={styles.menuButtonSign}>Sign out</button>
                        </div>
                        )}
                    </div>
                </ClickAwayListener>
            </div>
            <Link href="/">
                <Image src="/logo.jpg" alt="Site Logo" width={40} height={40} className={styles.logo} />
            </Link>
            
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
