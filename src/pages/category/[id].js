import { useRouter } from 'next/router';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import Link from 'next/link';
import Header from '../../components/header/header';
import { GET_ALL_ARTICLES_BY_CATEGORY_ID } from '../../graphql/queries';
import styles from './CategoryPage.module.css';

export async function getServerSideProps(context) {
  const { id } = context.params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    console.error('Invalid category ID:', id);
    return {
      notFound: true,
    };
  }

  let categoryData = null;

  try {
    const client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      cache: new InMemoryCache(),
    });
    console.log(`Fetching articles for category ID: ${categoryId}`);
    const categoryResponse = await client.query({
      query: GET_ALL_ARTICLES_BY_CATEGORY_ID,
      variables: { categoryId },
    });
    console.log('categoryResponse:', categoryResponse);
    if (categoryResponse && categoryResponse.data) {
      categoryData = categoryResponse.data.getAllArticlesByCategoryId;
    } else {
      throw new Error('Failed to fetch category data');
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
  }

  return {
    props: {
        category: categoryData || [],
    },
  };
}

const CategoryPage = ({ category }) => {
  const router = useRouter();
  const { id } = router.query;

  if (!category) {
    return <p>Category not found.</p>;
  }

  const categoryName = category.length > 0 ? category[0].category?.name || 'Category' : 'Category';

  const latestArticle = category[0];
  const otherArticles = category.slice(1);

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className="text-center font-bold " style={{ fontSize: '34px' }}>{categoryName}</h1>
        {category.length > 0 ? (
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
          <p>No articles found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
