import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import Header from '../../components/header/header';
import Link from 'next/link';

const GET_ARTICLE_QUERY = gql`
  query getArticleById($id: Int!) {
    getArticleById(id: $id) {
      id
      title
      content
      images {
        url
        alt
      }
    }
  }
`;



export default function ArticlePage() {
    const router = useRouter();
    const {id}  = router.query; // Get the id from the URL

    console.log(`[MyComp render] router.isReady=${router.isReady}, id=${id}`);
   

    // Convert and validate ID outside of useEffect to avoid re-run due to dependencies change
    const articleId = parseInt(id);
    const validId = !isNaN(articleId);

    useEffect(() => {console.log(`[MyComp render] router.isReady=${router.isReady}, id=${id}`);
      }, [router.isReady]);

    // Fetching data using Apollo Client's useQuery hook
    const { data, loading, error } = useQuery(GET_ARTICLE_QUERY, {
        variables: { id: articleId },
        skip: !validId // Skip the query until we have a valid id
    });
    

    // Loading and error handling
    if (loading) return <p>Loading...</p>;
    if (error) return <p>An error occurred: {error.message}</p>;

    const article = data?.getArticleById;

    return (
        <div>
          <Header />
          <div style={{ padding: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'blue' }}>
              Go back to home
            </Link>
            {article ? (
              <div>
                <h1>{article.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
                {article.images && article.images.map((img, index) => (
                  <img key={index} src={img.url} alt={img.alt || 'Article image'} style={{ width: '100%', marginTop: '10px' }} />
                ))}
              </div>
            ) : <p>Article not found.</p>}
          </div>
        </div>
      );
}
