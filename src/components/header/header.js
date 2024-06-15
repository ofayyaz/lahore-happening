import styles from './Header.module.css';
import Image from 'next/image';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';

export default function Header() {
    const [searchVisible, setSearchVisible] = useState(false);

    return (
        <div className={styles.header}>
            <div ><Button onClick={() => {/* handle menu */}}><MenuIcon/></Button></div>
            <Image src="/logo.png" alt="Logo" width={60} height={40} />
            <div onClick={() => setSearchVisible(!searchVisible)}>🔍</div>
            <div onClick={() => {/* handle contact */}}>✉️</div>
            {searchVisible && <input type="text" placeholder="Search articles..." className={styles.searchBar} />}
        </div>
    );
}
