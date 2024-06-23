// pages/admin/articles.js
import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import styles from './articles.module.css';
import Link from 'next/link';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const GET_ALL_ARTICLES = gql`
  query GetAllArticles {
    allArticles {
      id
      title
      content
      published
      featured
      
      images {
        url
        alt
      }
    }
  }
`;

const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: Int!) {
    deleteArticle(id: $id) {
      id
    }
  }
`;

const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($id: Int!, $title: String!, $content: String!, $categoryId: Int!, $authorId: Int!, $featured: Boolean, $published: Boolean, $images: [ImageInput!]) {
    updateArticle(id: $id, title: $title, content: $content, categoryId: $categoryId, authorId: $authorId, featured: $featured, published: $published, images: $images) {
      id
      title
    }
  }
`;

export default function ArticlesAdmin() {
    const { data, loading, error } = useQuery(GET_ALL_ARTICLES);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteArticle] = useMutation(DELETE_ARTICLE);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [open, setOpen] = useState(false);


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredArticles = data.allArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClickOpen = (article) => {
        setSelectedArticle(article);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedArticle(null);
    };

    const handleDelete = async () => {
        await deleteArticle({ variables: { id: selectedArticle.id } });
        setOpen(false);
        // Refetch articles or update cache to remove the deleted article from the list
        window.location.reload();
    };

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton component={Link} href="/admin" color="inherit" aria-label="return">
                        <ArrowBackIcon />
                    </IconButton>
                    <span style={{ marginLeft: '10px' }}>Back to Admin Page</span>
                </div>
                <h1 className={styles.title}>Manage Articles</h1>
                <div style={{ width: '148px' }}> {/* Placeholder to balance the header */}</div>
            </div>
            <div className={styles.searchBar}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                />
                <IconButton type="submit" aria-label="search">
                    <SearchIcon />
                </IconButton>
            </div>
            {filteredArticles.map(article => (
                <div key={article.id} className={styles.articleContainer}>
                    <Link href={`/admin/articles/edit/${article.id}`} className={styles.editButton}>
                        Edit
                    </Link>
                    <div className={styles.articleInfo}>
                        <strong>{article.title}</strong> - {article.content.slice(0, 100)}...
                    </div>
                    <Button variant="contained" onClick={() => handleClickOpen(article)} className={styles.deleteButton}>
                        Delete
                    </Button>
                </div>
            ))}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Delete Article"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the article titled "{selectedArticle?.title}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="secondary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
