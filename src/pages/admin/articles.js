// pages/admin/articles.js
import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import styles from './articles.module.css';
import Link from 'next/link';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredArticles = data.allArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                </div>
            ))}
        </div>
    );
}
