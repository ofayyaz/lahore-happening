import React from 'react';
import { IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import styles from './SharePanel.module.css';

const SharePanel = ({ url, title }) => {
  const handleShare = (platform) => {
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      default:
        break;
    }
    window.open(shareLink, '_blank');
  };

  return (
    <div className={styles.sharePanel}>
      <IconButton onClick={() => handleShare('facebook')} className={styles.shareButton}>
        <FacebookIcon />
      </IconButton>
      <IconButton onClick={() => handleShare('twitter')} className={styles.shareButton}>
        <TwitterIcon />
      </IconButton>
      <IconButton onClick={() => handleShare('email')} className={styles.shareButton}>
        <EmailIcon />
      </IconButton>
    </div>
  );
};

export default SharePanel;
