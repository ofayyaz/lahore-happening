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

  const featuredArticle = data.allArticles.find(article => article.featured);
  const otherArticles = data.allArticles.filter(article => !article.featured && article.published);

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.featuredContainer}>
          {featuredArticle && (
            <div key={featuredArticle.id}>
              <Link href={`/article/${featuredArticle.id}`}>
                <h2 className={styles.articleTitle}>{featuredArticle.title}</h2>
                {featuredArticle.images.map((img, index) => (
                  <img key={index} src={img.url} alt={img.alt || 'Article image'} className={styles.articleImage} />
                ))}
              </Link>
            </div>
          )}
        </div>
        <div className={styles.otherArticlesContainer}>
          {otherArticles.map(article => (
            <div key={article.id}>
              <Link href={`/article/${article.id}`}>
                <h2 className={styles.articleTitle}>{article.title}</h2>
                {article.images.map((img, index) => (
                  <img key={index} src={img.url} alt={img.alt || 'Article image'} className={styles.articleImage} />
                ))}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

