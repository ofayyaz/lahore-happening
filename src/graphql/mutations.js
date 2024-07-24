import { gql } from '@apollo/client';

export const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($commentId: Int!, $userId: Int!) {
    deleteComment(commentId: $commentId, userId: $userId) {
      id
    }
  }
`;
