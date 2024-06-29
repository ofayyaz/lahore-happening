import { useEffect,useState } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery, useMutation } from '@apollo/client';
import Header from '../../components/header/header';
import Link from 'next/link';
import Comment from '../../components/Comment';
//import firebase from '../../../firebaseConfig';
import { auth } from '../../../firebaseConfig'; // Import your Firebase config


const GET_ARTICLE_QUERY = gql`
  query getArticleById($id: Int!) {
    getArticleById(id: $id) {
      id
      title
      content
      author {
        name
      }
      images {
        url
        alt
      }
    }
  }
`;

const GET_COMMENTS_QUERY = gql`
  query getCommentsByArticleId($articleId: Int!) {
    getCommentsByArticleId(articleId: $articleId) {
      id
      content
      createdAt
      user {
        email
      }
      children {
        id
        content
        createdAt
        user {
          email
        }
      }
    }
  }
`

const ADD_COMMENT_MUTATION = gql`
  mutation createComment($content: String!, $articleId: Int!, $userId: ID!, $parentId: Int) {
    createComment(content: $content, articleId: $articleId, userId: $userId, parentId: $parentId) {
      id
      content
      user {
        email
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

    const [comment, setComment] = useState('');
    const [parentId, setParentId] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {console.log(`[MyComp render] router.isReady=${router.isReady}, id=${id}`);
      }, [router.isReady]);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        setUser(user);
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    }, []);

    // Fetching data using Apollo Client's useQuery hook
    const { data: articleData, loading: articleLoading, error: articleError } = useQuery(GET_ARTICLE_QUERY, {
        variables: { id: articleId },
        skip: !validId // Skip the query until we have a valid id
    });

    const { data: commentsData, loading: commentsLoading, error: commentsError } = useQuery(GET_COMMENTS_QUERY, {
      variables: { articleId },
      skip: !validId
    });
    
    const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
      refetchQueries: [{ query: GET_ARTICLE_QUERY, variables: { id: articleId } }],
    });

    // Loading and error handling
    if (articleLoading || commentsLoading) return <p>Loading...</p>;
    if (articleError) return <p>An error occurred: {articleError.message}</p>;
    if (commentsError) return <p>An error occurred: {commentsError.message}</p>;

    

    const handleAddComment = async () => {
      try {
        await createComment({ variables: { content: comment, articleId, userId: user.id, parentId } });
        setComment('');
        setParentId(null); // Reset parentId after adding a comment
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };

    const handleReply = (id) => {
      setParentId(id);
    };
  
    const article = articleData?.getArticleById;
    const comments = commentsData?.getCommentsByArticleId;

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
                <div style={{ marginTop: '20px' }}>
              <h2>Comments</h2>
              {comments.length > 0 ? (
                comments.map(comment => (
                  <Comment key={comment.id} comment={comment} nestingLevel={0} />
                ))
              ) : (
                <p>No comments yet.</p>
              )}
              {user ? (
                <div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your comment"
                    style={{ width: '100%', marginTop: '10px', padding: '10px' }}
                  />
                  <button onClick={handleAddComment} style={{ marginTop: '10px' }}>
                    {parentId ? 'Reply to Comment' : 'Add Comment'}
                  </button>
                </div>
              ) : (
                <p>Please log in to add a comment.</p>
              )}
            </div>
              </div>
            ) : <p>Article not found.</p>}
          </div>
        </div>
      );
}
