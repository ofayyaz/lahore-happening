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

    const imagePromises = images.map(async img => {
        if (img.id) {
            // Update existing images
            return prisma.image.update({
                where: { id: img.id },
                data: { url: img.url, alt: img.alt || null }
            });
        } else {
            // Check if the image URL already exists to avoid duplicates
            const existingImage = await prisma.image.findFirst({
                where: { url: img.url }
            });
            if (!existingImage) {
                // Create new image only if it does not exist
                return prisma.image.create({
                    data: {
                        url: img.url,
                        alt: img.alt || null,
                        article: { connect: { id: parseInt(id) } }
                    }
                });
            }
        }
    });

    await Promise.all(imagePromises);

    return updatedArticle;
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
    deleteImage: async (_, args) => await prisma.image.delete({ where: { id: parseInt(args.id) } }),

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