import { gql } from '@apollo/client';

export const GET_ARTICLE = gql`
 query GetArticleById($id: Int!) {
   getArticleById(id: $id) {
     id
     title
     content
     published
     featured
     category {
       id
       name
     }
     author {
       id
       name
     }
     images {
      id
      url
      alt
     }
   }
 }
`;

export const GET_CATEGORIES = gql`
 query GetCategories {
   allCategories {
     id
     name
   }
 }
`;

export const GET_AUTHORS = gql`
 query GetAuthors {
   allAuthors {
     id
     name
   }
 }
`;

export const GET_COMMENTS_QUERY = gql`
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
`;

export const GET_ARTICLE_QUERY = gql`
  query GetArticleById($id: Int!) {
    getArticleById(id: $id) {
      id
      title
      content
      createdAt
      updatedAt
      published
      featured
      category {
        id
        name
      }
      author {
        id
        name
      }
      images {
        id
        url
        alt
      }
    }
  }
`;

export const UPDATE_ARTICLE = gql`
 mutation UpdateArticle($id: Int!, $title: String!, $content: String!, $categoryId: Int!, $authorId: Int!, $featured: Boolean!, $published: Boolean!, $images: [ImageInput!]) {
    updateArticle(id: $id, title: $title, content: $content, categoryId: $categoryId, authorId: $authorId, featured: $featured, published: $published, images: $images) {
        id
        title
        content
        published
        featured
        category {
          id
          name
        }
        author {
          id
          name
        }
        images {
          id
          url
          alt
        }
    }
 }
`;

export const DELETE_IMAGE = gql`
 mutation DeleteImage($id: Int!) {
    deleteImage(id: $id) {
        id
    }
 }
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      email
      displayName
      role
    }
  }
`;

export const ADD_COMMENT_MUTATION = gql`
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

export const LIKE_COMMENT_MUTATION = gql`
  mutation likeComment($commentId: Int!, $userId: Int!) {
    likeComment(commentId: $commentId, userId: $userId) {
      id
      likeCount
    }
  }
`;

export const GET_ALL_ARTICLES_BY_CATEGORY_ID = gql`
  query GetAllArticlesByCategoryId($categoryId: Int!) {
    getAllArticlesByCategoryId(categoryId: $categoryId) {
      id
      title
      category {
        name
      }
      images {
        id
        url
        alt
      }
    }
  }
`;

export const GET_ALL_ARTICLES_BY_AUTHOR_ID= gql`
  query GetAllArticlesByAuthorId($authorId: Int!) {
    getAllArticlesByAuthorId(authorId: $authorId) {
      id
      title
      category {
        name
      }
      images {
        id
        url
        alt
      }
    }
  }
`;