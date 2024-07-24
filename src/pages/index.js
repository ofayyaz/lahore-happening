import Header from '../components/header/header';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import client from '../lib/apolloClient';
import styles from './Home.module.css';


const ALL_ARTICLES_QUERY = gql`
  query GetAllArticles {
    allArticles {
      id
      title
      content
      featured
      published
      images {
        url
        alt
      }
    }
  }
`;


export default function Home() {

  const { data, loading, error } = useQuery(ALL_ARTICLES_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const featuredArticles = data.allArticles
  .filter(article => article.featured && article.published)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const featuredArticle = featuredArticles[0];
  const otherArticles = featuredArticles.slice(1, 4); // Get the next three featured articles

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.featuredContainer}>
          {featuredArticle && (
            <div key={featuredArticle.id} className={styles.mainFeaturedArticle}>
              <Link href={`/article/${featuredArticle.id}`}>
                <div>
                  <img
                    src={featuredArticle.images[0]?.url}
                    alt={featuredArticle.images[0]?.alt || 'Article image'}
                    className={styles.featuredImage}
                  />
                  <h2 className={styles.mainArticleTitle}>{featuredArticle.title}</h2>
                </div>
              </Link>
            </div>
          )}
        </div>
        <div className={styles.otherArticlesContainer}>
          {otherArticles.map((article, index) => (
            <div key={article.id} className={styles.sideFeaturedArticle}>
              <Link href={`/article/${article.id}`}>
                <div className={styles.sideArticleContent}>
                  <img
                    src={article.images[0]?.url}
                    alt={article.images[0]?.alt || 'Article image'}
                    className={styles.sideImage}
                  />
                  <h2 className={styles.sideArticleTitle}>{article.title}</h2>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

