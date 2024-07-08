import { useEffect,useState } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery, useMutation , ApolloClient, InMemoryCache} from '@apollo/client';
import Header from '../../components/header/header';
import Link from 'next/link';
import Comment from '../../components/Comment';
import { auth } from '../../../firebaseConfig'; // Import your Firebase config
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { GET_ARTICLE_QUERY, GET_COMMENTS_QUERY, ADD_COMMENT_MUTATION, GET_USER_BY_EMAIL, LIKE_COMMENT_MUTATION } from '../../graphql/queries';

export async function getServerSideProps(context) {
  const { id } = context.params;
  const articleId = parseInt(id);
  let articleData = null;
  let commentsData = null;

  try {
    const client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      cache: new InMemoryCache(),
    });

    const articleResponse = await client.query({
      query: GET_ARTICLE_QUERY,
      variables: { id: articleId },
    });

    if (articleResponse && articleResponse.data) {
      articleData = articleResponse.data;
    } else {
      throw new Error('Failed to fetch article data');
    }

    const commentsResponse  = await client.query({
      query: GET_COMMENTS_QUERY,
      variables: { articleId },
    });

    if (commentsResponse && commentsResponse.data) {
      commentsData = commentsResponse.data;
    } else {
      throw new Error('Failed to fetch comments data');
    }

  } catch (error) {
    console.error('Error in getServerSideProps:', error);
  }

  return {
    
    props: {
      article: articleData ? articleData.getArticleById : null,
      comments: commentsData ? commentsData.getCommentsByArticleId : [],
      //user,
      //userId,
    },
  };
}

const ArticlePage =({ article, comments, }) =>{
    const router = useRouter();
    const {id}  = router.query; // Get the id from the URL
    const articleId = parseInt(id);
    //const validId = !isNaN(articleId);
    const [comment, setComment] = useState('');
    const [parentId, setParentId] = useState(null);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null); // State to store database user ID

    const { data: userData, refetch: refetchUser } = useQuery(GET_USER_BY_EMAIL, {
      skip: !user,
      variables: { email: user ? user.email : "" }
    });

    useEffect(() => {
      const fetchUserData = async (firebaseUser) => {
        try {
          const { data } = await refetchUser({ email: firebaseUser.email });
          if (data && data.getUserByEmail) {
            setUserId(data.getUserByEmail.id);
          } else {
            console.error('User not found in database.');
          }
        } catch (error) {
          console.error('Error fetching user from database:', error.message);
        }
      };
  
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          await fetchUserData(firebaseUser);
          setUser(firebaseUser);
        }
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    }, [refetchUser]);

    useEffect(() => {
      if (router.query.comment && user) {
        document.getElementById('commentInput').focus();
      }
    }, [router.query.comment, user]);

    const [createComment] = useMutation(ADD_COMMENT_MUTATION, {
      refetchQueries: [{ query: GET_ARTICLE_QUERY, variables: { id: article?.id } }],
    });

    const [likeComment] = useMutation(LIKE_COMMENT_MUTATION, {
      refetchQueries: [{ query: GET_COMMENTS_QUERY, variables: { articleId } }],
    });

    // Loading and error handling
    //if (articleLoading || commentsLoading) return <p>Loading...</p>;
    //if (articleError) return <p>An error occurred: {articleError.message}</p>;
    //if (commentsError) return <p>An error occurred: {commentsError.message}</p>;

    const handleAddComment = async () => {
      if (!userId) {
        console.error('User ID is null. Cannot add comment.');
        return;
      }
      try {
        await createComment({ variables: { content: comment, articleId, userId, parentId } });
        setComment('');
        setParentId(null); // Reset parentId after adding a comment
        router.reload();
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };

    const handleReply = async (parentId, replyText) => {
      if (!userId) {
        console.error('User ID is null. Cannot add reply.');
        return;
      }
      try {
        await createComment({
          variables: {
            content: replyText,
            articleId,
            userId, // Use database user ID
            parentId,
          },
        });
        router.reload(); // Reload the page to refresh the data
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    };

    const handleLike = async (commentId) => {
      if (!userId) {
        console.error('User ID is null. Cannot like comment.');
        return;
      } try {
        await likeComment({
          variables: {
            commentId,
            userId,
          },
        });
        router.reload(); // Reload the page to refresh the data
      } catch (error) {
        console.error('Error liking comment:', error);
      }
    };
  
    //const article = articleData?.getArticleById;
    //const comments = commentsData?.getCommentsByArticleId;
    const rootComments = comments?.filter(comment => comment.parentId === null).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];

    return (
        <div>
          <Header />
          <div style={{ padding: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'blue' }}>
              Go back to home
            </Link>
            {article ? (
              <div>
                <h1 className="text-center font-bold">{article.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
                
                <div style={{ marginTop: '20px' }}>
              <h2>Comments</h2>
              {rootComments.length > 0 ? (
                rootComments.map(comment => (
                  <Comment key={comment.id} comment={comment} onReply={handleReply} onLike={handleLike} />
                ))
              ) : (
                <p>No comments yet.</p>
              )}
              {user ? (
                <div className="p-2.5 border border-gray-300 rounded mt-2.5 shadow-inner">
                  <textarea
                    id="commentInput"
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
                <p>Please <Link href={`/login?redirect=${encodeURIComponent(router.asPath)}`}><span style={{ textDecoration: 'none', color: 'blue' }}>log in</span></Link> to add a comment.</p>
              )}
            </div>
              </div>
            ) : <p>Article not found.</p>}
          </div>
        </div>
      );
}

export default ArticlePage;


/*
{article.images && article.images.map((img, index) => (
                  <img key={index} src={img.url} alt={img.alt || 'Article image'} style={{ width: '100%', marginTop: '10px' }} />
                ))}
                */

/*
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
      parentId
      likeCount
      user {
        displayName
        email
      }
      children {
        id
        content
        createdAt
        likeCount
        parentId
        user {
          displayName
          email
        }
      }
    }
  }
`

const ADD_COMMENT_MUTATION = gql`
  mutation createComment($content: String!, $articleId: Int!, $userId: Int!, $parentId: Int) {
    createComment(content: $content, articleId: $articleId, userId: $userId, parentId: $parentId) {
      id
      content
      user {
        email
      }
      likeCount
    }
  }
`;

const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      email
      displayName
    }
  }
`;

const LIKE_COMMENT_MUTATION = gql`
  mutation likeComment($commentId: Int!, $userId: Int!) {
    likeComment(commentId: $commentId, userId: $userId) {
      id
      likeCount
    }
  }
`;
*/

/*
    // Fetching data using Apollo Client's useQuery hook
    const { data: articleData, loading: articleLoading, error: articleError } = useQuery(GET_ARTICLE_QUERY, {
        variables: { id: articleId },
        skip: !validId // Skip the query until we have a valid id
    });

    const { data: commentsData, loading: commentsLoading, error: commentsError } = useQuery(GET_COMMENTS_QUERY, {
      variables: { articleId },
      skip: !validId
    });
    */
