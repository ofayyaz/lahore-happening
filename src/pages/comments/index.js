import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import withAuth from '../../components/withAuth';
import { GET_COMMENTS, ADD_COMMENT } from '../../graphql/queries';

const CommentsPage = ({ user }) => {
  const { loading, error, data } = useQuery(GET_COMMENTS);
  const [addComment] = useMutation(ADD_COMMENT);
  const [comment, setComment] = useState('');

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>Error loading comments.</p>;

  const handleAddComment = async () => {
    try {
      await addComment({ variables: { content: comment, userId: user.uid } });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div>
      <h1>Comments</h1>
      <div>
        {data.comments.map((comment) => (
          <div key={comment.id}>
            <p><strong>{comment.user.email}:</strong> {comment.content}</p>
          </div>
        ))}
      </div>
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment"
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default withAuth(CommentsPage);
