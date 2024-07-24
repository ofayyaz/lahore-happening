import { useRouter } from 'next/router';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import Link from 'next/link';
import Header from '../../components/header/header';
import { GET_ALL_ARTICLES_BY_AUTHOR_ID } from '../../graphql/queries';
import styles from './AuthorPage.module.css';

export async function getServerSideProps(context) {
  const { id } = context.params;
  const authorId = parseInt(id);

  if (isNaN(authorId)) {
    console.error('Invalid author ID:', id);
    return {
      notFound: true,
    };
  }

  let authorData = null;

  try {
    const client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      cache: new InMemoryCache(),
    });
    console.log(`Fetching articles for author ID: ${authorId}`);
    const authorResponse = await client.query({
      query: GET_ALL_ARTICLES_BY_AUTHOR_ID,
      variables: { authorId },
    });
    console.log('authorResponse:', authorResponse);
    if (authorResponse && authorResponse.data) {
      authorData = authorResponse.data.getAllArticlesByAuthorId;
    } else {
      throw new Error('Failed to fetch author data');
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
  }

  return {
    props: {
      authorsArticles: authorData || [],
    },
  };
}

const AuthorPage = ({ authorsArticles }) => {
  const router = useRouter();
  const { id } = router.query;

  if (!authorsArticles) {
    return <p>Author not found.</p>;
  }

  const authorName = authorsArticles.length > 0 ? authorsArticles[0].author?.name || 'Author' : 'Author';
  const latestArticle = authorsArticles[0];
  const otherArticles = authorsArticles.slice(1);

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className="text-center font-bold " style={{ fontSize: '34px' }}>{authorName}</h1>
        {authorsArticles.length > 0 ? (
          <div>
            <div className={styles.latestArticle}>
              {latestArticle.images && latestArticle.images.length > 0 && (
                <Link href={`/article/${latestArticle.id}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                  <img src={latestArticle.images[0]?.url} alt={latestArticle.images[0]?.alt || 'Article image'} className={styles.latestImage} />
                  <h2 className={styles.latestTitle} style={{ fontSize: '24px' }}>{latestArticle.title}</h2>
                </Link>
              )}
            </div>
            <div className={styles.gridContainer}>
              {otherArticles.map(article => (
                <div key={article.id} className={styles.gridItem}>
                  <Link href={`/article/${article.id}`} style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                    {article.images && article.images.length > 0 && (
                      <img src={article.images[0]?.url} alt={article.images[0]?.alt || 'Article image'} className={styles.gridImage} />
                    )}
                    <h3 className={styles.gridTitle}>{article.title}</h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No articles found for this author.</p>
        )}
      </div>
    </div>
  );
};

export default AuthorPage;
