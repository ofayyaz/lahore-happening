//const { PrismaClient } = require('@prisma/client');
//const prisma = new PrismaClient();

const prisma = require('../../prismaClientInstance');

const Query = {
    allArticles: async () => await prisma.article.findMany({
      include: {
        images: true,    // Include all related images
        comments: false   // Include all related comments
      }
    }),
    allCategories: async (_, args) => await prisma.category.findMany(),
    allAuthors: async (_, args) => await prisma.author.findMany(),
    allComments: async (_, args, { prisma }) => await prisma.comment.findMany(),
    allImages: async (_, args, { prisma }) => await prisma.image.findMany(),
    allCollections: async (_, args, { prisma }) => await prisma.collection.findMany(),
    
    getArticleById: async (_, { id }) => await prisma.article.findUnique({ where: { id: parseInt(id) } , include: {
      images: true,      // Fetch all related images
      category: true,    // Fetch the associated category
      author: true,      // Fetch the associated author
      collection: true   // Fetch the associated collection, if any
    }}),

    getCommentsByArticleId: async (_, { articleId },) => {
      const comments = await prisma.comment.findMany({
        where: { articleId: parseInt(articleId)} ,
        include: {
          user: true,
          children: {
            include: {
              user: true,
            }
          }
        }    
      });
      return comments || [];
    },

    getAllArticlesByCategoryId: async (_, { categoryId }) => {
      const articles = await prisma.article.findMany({
        where: { categoryId: parseInt(categoryId) },
        include: {
          category: true,
          author: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return articles || [];
    },
    
    getAllArticlesByAuthorId: async (_, { authorId }) => {
      const articles = await prisma.article.findMany({
        where: { authorId: parseInt(authorId) },
        include: {
          category: true,
          author: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return articles || [];
    },

    getCategoryById: async (_, { id }) => await prisma.category.findUnique({ where: { id: parseInt(id) } }),
    getAuthorById: async (_, { id }) => await prisma.author.findUnique({ where: { id: parseInt(id) } }),
    getCommentById: async (_, { id }) => await prisma.comment.findUnique({ where: { id: parseInt(id) } }),
    getImageById: async (_, { id }) => await prisma.image.findUnique({ where: { id: parseInt(id) } }),
    getCollectionById: async (_, { id }) => await prisma.collection.findUnique({ where: { id: parseInt(id) } }),

    user: async (_, { id }) => {
      return await prisma.user.findUnique({
        where: { id: id },
      });
    },
    users: async () => {
      return await prisma.user.findMany();
    },

    getUserByEmail: async (_, { email }) => {
      return await prisma.user.findUnique({
        where: { email },
      });
    },

    searchUsers: async (_, { query }) => {
      return await prisma.user.findMany({
        where: {
          OR: [
            { displayName: { contains: query } },
            { email: { contains: query } }
          ]
        }
      });
    },
    
    testContext: (_, __, context) => {
      console.log(context);  // This will log the entire context object
      return "Check server console log for context details.";
    },

    testArticleModel: async (_, args, ) => {
      try {
        if (!prisma) {
          console.error("Prisma client is not available in the context.");
          return "Prisma client is not available.";
        }
        //console.log(prisma.article); // This logs the model's functions if available
        if (prisma.article) {
          return "Article model is accessible and functions are logged in the console.";
        } else {
          return "Article model is not accessible.";
        }
      } catch (error) {
        console.error("Error accessing Article model:", error);
        return "Failed to access Article model due to an error.";
      }
    }
  }

module.exports = Query;