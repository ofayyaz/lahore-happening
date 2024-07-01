import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Comment.module.css'; 
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const Comment = ({ comment, onLike, onReply }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className="border border-gray-300 rounded p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <strong>{comment.user.displayName || comment.user.email}</strong> - {new Date(comment.createdAt).toLocaleString()}
        </div>
        <div className="flex items-center">
          <ThumbUpIcon className="mr-1 cursor-pointer" onClick={() => onLike(comment.id)} />
          <span>{comment.likeCount}</span>
        </div>
      </div>
      <div className="mt-2">
        {comment.content}
      </div>
      <div className="flex justify-between items-center mt-2">
        {comment.parentId === null && (
          <button onClick={() => setShowReply(!showReply)} className="text-blue-500">Reply</button>
        )}
      </div>
      {showReply && (
        <div className="mt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Enter your reply"
            className="w-full p-2.5 rounded border border-gray-300"
          />
          <button onClick={handleReply} className="mt-2.5 text-blue-500">Submit Reply</button>
        </div>
      )}
      <div className="ml-5 mt-2">
        {comment.children && [...comment.children].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(child => (
          <Comment key={child.id} comment={child} onReply={onReply} onLike={onLike} />
        ))}
      </div>
    </div>
  );
};

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  onReply: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default Comment;
