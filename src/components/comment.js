import React from 'react';
import PropTypes from 'prop-types';
import styles from './Comment.module.css'; 

const Comment = ({ comment, nestingLevel }) => {
  return (
    <div className={styles.comment} style={{ marginLeft: nestingLevel * 20 }}>
      <div className={styles.commentHeader}>
        <strong>{comment.user.email}</strong> - {new Date(comment.createdAt).toLocaleString()}
      </div>
      <div className={styles.commentContent}>
        {comment.content}
      </div>
      <div className={styles.commentChildren}>
        {comment.children && comment.children.map(child => (
          <Comment key={child.id} comment={child} nestingLevel={nestingLevel + 1} />
        ))}
      </div>
    </div>
  );
};

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  nestingLevel: PropTypes.number.isRequired,
};

export default Comment;
