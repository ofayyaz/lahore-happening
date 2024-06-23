//const { PrismaClient } = require('@prisma/client');
//const prisma = new PrismaClient();

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
    deleteArticle: async (_, args) => await prisma.article.delete({ where: { id: parseInt(args.id) } }),

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

    createComment: async (_, args) => await prisma.comment.create({
      data: {
        text: args.text,
        articleId: args.articleId,
      }
    }),
    updateComment: async (_, args) => await prisma.comment.update({
      where: { id: parseInt(args.id) },
      data: { text: args.text },
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
  }

module.exports = Mutation;

/*
prisma.article.create({
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
        images: validImages.map(img => ({
          create: {
            url: img.url,
            alt: img.alt || ""
          }
        })),
        collection: collectionId ? { connect: { id: parseInt(collectionId) } } : undefined
      }
    });

     prisma.article.create({
        data: {
          title: title,
          content: content,
          categoryId: categoryId,  
          authorId: authorId,    
          published: false,
          featured: false
        }
    });
*/