import Header from '../components/header/header';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import client from '../lib/apolloClient';


const ALL_ARTICLES_QUERY = gql`
  query GetAllArticles {
    allArticles {
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


export default function Home() {

  const { data, loading, error } = useQuery(ALL_ARTICLES_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const featuredArticle = data.allArticles.find(article => article.featured);
  const otherArticles = data.allArticles.filter(article => !article.featured);


  return (
    <div>
            <Header />
            <div >
                {data.allArticles.map(article => (
                    <div key={article.id}>
                        <Link href={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                            <h2>{article.title}</h2>
                            {article.images && article.images.map((img, index) => (
                              <img key={index} src={img.url} alt={img.alt || 'Article image'} />
                            ))}
                        </Link>

                    </div>
                ))}
            </div>
        </div>
    
  );
}