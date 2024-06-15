// pages/admin/articles.js
import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import styles from './articles.module.css';
import Link from 'next/link';

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Articles</h1>
            {data.allArticles.map(article => (
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
