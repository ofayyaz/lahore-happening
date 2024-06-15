//const { PrismaClient } = require('@prisma/client');
//const prisma = new PrismaClient();

const prisma = require('../../prismaClientInstance');

const Query = {
    allArticles: async () => await prisma.article.findMany({
      include: {
        images: true,    // Include all related images
        comments: true   // Include all related comments
      }
    }),
    allCategories: async (_, args) => await prisma.category.findMany(),
    allAuthors: async (_, args) => await prisma.author.findMany(),
    allComments: async (_, args, { prisma }) => await prisma.comment.findMany(),
    allImages: async (_, args, { prisma }) => await prisma.image.findMany(),
    allCollections: async (_, args, { prisma }) => await prisma.collection.findMany(),
    
    getArticleById: async (_, { id }) => await prisma.article.findUnique({ where: { id: parseInt(id) } , include: {
      images: true,      // Fetch all related images
      comments: true,    // Fetch all related comments
      category: true,    // Fetch the associated category
      author: true,      // Fetch the associated author
      collection: true   // Fetch the associated collection, if any
    }}),
    getCategoryById: async (_, { id }) => await prisma.category.findUnique({ where: { id: parseInt(id) } }),
    getAuthorById: async (_, { id }) => await prisma.author.findUnique({ where: { id: parseInt(id) } }),
    getCommentById: async (_, { id }) => await prisma.comment.findUnique({ where: { id: parseInt(id) } }),
    getImageById: async (_, { id }) => await prisma.image.findUnique({ where: { id: parseInt(id) } }),
    getCollectionById: async (_, { id }) => await prisma.collection.findUnique({ where: { id: parseInt(id) } }),

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