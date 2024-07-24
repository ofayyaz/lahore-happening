const { gql } = require('apollo-server-micro');

const typeDefs =  gql`
type Query {
  # Fetching multiple entities
  allArticles: [Article!]!
  allCategories: [Category!]!
  allAuthors: [Author!]!
  allComments: [Comment!]!
  allImages: [Image!]!
  allCollections: [Collection!]!
  
  # Fetching single entities by ID
  getArticleById(id: Int!): Article
  getCategoryById(id: Int!): Category
  getAuthorById(id: Int!): Author
  getCommentById(id: Int!): Comment
  getImageById(id: Int!): Image
  getCollectionById(id: Int!): Collection

  getAllArticlesByCategoryId(categoryId: Int!): [Article!]!
  getAllArticlesByAuthorId(authorId: Int!): [Article!]!

  getCommentsByArticleId(articleId: Int!): [Comment!]!

  user(id: Int!): User
  users: [User!]!
  getUserByEmail(email: String!): User
  searchUsers(query: String!): [User!]!

  testArticleModel: String
  testContext: String

}

input ImageInput {
  url: String
  alt: String
}

type Mutation {
  # Article mutations
  createArticle(
    title: String!, 
    content: String!, 
    categoryId: Int!, 
    authorId: Int!, 
    featured: Boolean, 
    published: Boolean,
    images: [ImageInput!],
    collectionId: Int
  ): Article!

  updateArticle(
    id: Int!, 
    title: String, 
    content: String, 
    categoryId: Int, 
    authorId: Int, 
    featured: Boolean, 
    published: Boolean,
    images: [ImageInput!]  # Support image input on update
  ): Article!

  deleteArticle(id: Int!): Article!

  # Category mutations
  createCategory(name: String!): Category!
  updateCategory(id: Int!, name: String!): Category!
  deleteCategory(id: Int!): Category!

  # Author mutations
  createAuthor(name: String!, bio: String): Author!
  updateAuthor(id: Int!, name: String, bio: String): Author!
  deleteAuthor(id: Int!): Author!

  # Comment mutations
  createComment(content: String!, articleId: Int!, userId: Int!, parentId: Int): Comment
  updateComment(id: Int!, content: String!): Comment!
  deleteComment(id: Int!): Comment!
  likeComment(commentId: Int!, userId: Int!): Comment!

  # Image mutations
  createImage(url: String!, articleId: Int!, alt: String): Image!
  updateImage(id: Int!, url: String, alt: String): Image!
  deleteImage(id: Int!): Image!

  # Collection mutations
  createCollection(title: String!, description: String): Collection!
  updateCollection(id: Int!, title: String, description: String): Collection!
  deleteCollection(id: Int!): Collection!

  # User mutations
  createUser(email: String!, displayName: String!, provider: String!): User!
  updateUserRole(id: ID!, role: String!): User!
}

type Article {
  id: Int!
  title: String!
  content: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  published: Boolean!
  featured: Boolean!
  category: Category!
  categoryId: Int!
  author: Author!
  authorId: Int!
  comments: [Comment!]
  images: [Image!]
  collection: Collection
  collectionId: Int
}

type Category {
  id: Int!
  name: String!
  articles: [Article!]!
}

type Author {
  id: Int!
  name: String!
  bio: String
  articles: [Article!]!
}

type Comment {
  id: Int!
  content: String!
  createdAt: DateTime!
  article: Article!
  articleId: Int!
  user: User!
  userId: Int!
  parent: Comment
  parentId: Int
  children: [Comment!]
  likeCount: Int!
}

type Image {
  id: Int!
  url: String!
  alt: String
  article: Article!
  articleId: Int!
}

type Collection {
  id: Int!
  title: String!
  description: String
  articles: [Article!]!
}

type User {
  id: Int!
  email: String!
  displayName: String!
  photoURL: String
  provider: String!
  comment: [Comment!]
  role: String!
}

type Like {
  id: Int!
  commentId: Int!
  userId: Int!
  createdAt: String!
}

scalar DateTime
`
module.exports = typeDefs;