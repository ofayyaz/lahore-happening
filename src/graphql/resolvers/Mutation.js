//const { PrismaClient } = require('@prisma/client');
//const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const prisma = require('../../prismaClientInstance');

const Mutation = {
  createArticle: async (_, args,) => {
    const { title, content, categoryId, authorId, featured, published ,images, collectionId} = args;
    const imageOperations = images && images.length > 0 ? images.map(img => ({
      url: img.url,
      alt: img.alt || null  // Set to null if alt text is not provided; adjust based on your schema requirements.
    })) : [];

    return await prisma.article.create({
      data: {
        title,
        content,
        featured,
        published,
        category: {
          connect: { id: parseInt(categoryId) }
        },
        author: {
          connect: { id: parseInt(authorId) }
        },
        images: {
            create: imageOperations,  // This should handle the creation of related images.
          },
        collection: collectionId ? { connect: { id: parseInt(collectionId) } } : undefined
      }, include: {
        images: true // Ensure to include this line to fetch the related images in the response
      }
    });
   
  },

  updateArticle: async (_, args,  ) => {
    const { id, title, content, categoryId, authorId, featured, published, images } = args;
    const updatedArticle = await prisma.article.update({
        where: { id: parseInt(id) },
        data: {
            title,
            content,
            featured,
            published,
            category: { connect: { id: parseInt(categoryId) } },
            author: { connect: { id: parseInt(authorId) } },
        }
    });
    const initialImages = await prisma.image.findMany({
      where: { articleId: parseInt(id) }
    });
    
    const initialImagesIds = initialImages.map(img=>img.id).filter(id=>id!==undefined);
    const newImages = images.filter(img=> !img.id);
    const currentImageIds = images.map(img => img.id).filter(id=> id!==undefined);
    const imagesToDeleteIds = initialImagesIds.filter(id => !currentImageIds.includes(id)); 
    const existingImages = images.filter(img => img.id);
    await Promise.all(imagesToDeleteIds.map(imgId => prisma.image.delete({ where: { id: imgId } })));
    
    await Promise.all(existingImages.map(img => {
      return prisma.image.update({
        where: { id: img.id },
        data: {
          url: img.url,
          alt: img.alt || null
        }
      });
    }));
    await Promise.all(newImages.map(img => {
      return prisma.image.create({
        data: {
          url: img.url,
          alt: img.alt || null,
          article: { connect: { id: parseInt(id) } }
        }
      });  
    }
  ));
  return prisma.article.findUnique({
    where: { id: parseInt(id) },
    include: {
        category: true,
        author: true,
        images: true
    }
  });
  }

  ,
  deleteArticle: async (_, args) => {
    const articleId = parseInt(args.id);
    await prisma.image.deleteMany({
      where: {
        articleId: articleId,
      },
    });
    const deletedArticle = await prisma.article.delete({
      where: {
        id: articleId,
      },
    });
    return deletedArticle;
  },

  createCategory: async (_, args) => await prisma.category.create({ data: { name: args.name } }),
  
  updateCategory: async (_, args) => await prisma.category.update({
    where: { id: parseInt(args.id) },
    data: { name: args.name },
  }),

  deleteCategory: async (_, args) => await prisma.category.delete({ where: { id: parseInt(args.id) } }),

  createAuthor: async (_, args) => await prisma.author.create({
    data: {
      name: args.name,
      bio: args.bio,
    }
  }),

  updateAuthor: async (_, args) => await prisma.author.update({
    where: { id: parseInt(args.id) },
    data: args,
  }),

  deleteAuthor: async (_, args) => await prisma.author.delete({ where: { id: parseInt(args.id) } }),

  createComment: async (_, { content, articleId, userId, parentId },) => {
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: { parent: true }
      });

      if (parentComment.parentId) {
        throw new Error('Replies to replies are not allowed.');
      }
    }
    return await prisma.comment.create({
      data: {
        content,
        articleId,
        userId,
        parentId,
        likeCount: 0, 
      },
      include: {
        user: true, // Include the user data in the response
      },
    });
  },

  likeComment: async (_, { commentId, userId },) => {
    const existingLike = await prisma.like.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw new Error("You have already liked this comment.");
    }
    try {
      const like = await prisma.like.create({
        data: {
          commentId,
          userId,
        },
      });

      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        include: {
          user: true,
        },
      });

    return comment;
    } catch (error) {
      if (error.code === 'P2002') {  // Unique constraint violation error code in Prisma
        // Log the error if needed, but do not throw
        console.log("User has already liked this comment");
      }
    }
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          user: true,
        },
      });

      return comment;
    },
  

  updateComment: async (_, args) => await prisma.comment.update({
    where: { id: parseInt(args.id) },
    data: { content: args.content },
  }),

  deleteComment: async (_, args) => await prisma.comment.delete({ where: { id: parseInt(args.id) } }),

  createImage: async (_, args) => await prisma.image.create({
    data: {
      url: args.url,
      articleId: args.articleId,
      alt: args.alt,
    }
  }),

  updateImage: async (_, args) => await prisma.image.update({
    where: { id: parseInt(args.id) },
    data: args,
  }),

  deleteImage: async (_, { id }) => {
    try {
      const deletedImage = await prisma.image.delete({
        where: { id },
      });
      return deletedImage;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  },

  createUser: async (_, { email, displayName, provider }) => {
    return await prisma.user.create({
      data: {
        email,
        displayName,
        provider,
      },
    });
  },

  updateUserRole: async (_, { id, role }) => {
    return await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });
  },

  createCollection: async (_, args) => await prisma.collection.create({
    data: {
      title: args.title,
      description: args.description,
    }
  }),

  updateCollection: async (_, args) => await prisma.collection.update({
    where: { id: parseInt(args.id) },
    data: args,
  }),

  deleteCollection: async (_, args) => await prisma.collection.delete({ where: { 
    id: parseInt(args.id) } }),

  likeComment: async (_, { commentId, userId  }, ) => {
    const like = await prisma.like.create({
      data: {
        commentId,
        userId,
      },
    });

    const comment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });
    return comment;
  },
}

module.exports = Mutation;
