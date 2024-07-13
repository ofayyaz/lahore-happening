import { useState, useEffect,useRef } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, gql  } from '@apollo/client';
import Link from 'next/link';
import styles from './EditArticle.module.css';
import ArticleForm from '../../../../components/adminForms/ArticleForm';
import ImageManager from '../../../../components/adminForms/ImageManager';
import PrivateRoute from '../../../../components/PrivateRoute';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import 'quill/dist/quill.snow.css';

const GET_ARTICLE = gql`
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

const GET_CATEGORIES = gql`
 query GetCategories {
   allCategories {
     id
     name
   }
 }
`;

const GET_AUTHORS = gql`
 query GetAuthors {
   allAuthors {
     id
     name
   }
 }
`;

const UPDATE_ARTICLE = gql`
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

const DELETE_IMAGE = gql`
 mutation DeleteImage($id: Int!) {
    deleteImage(id: $id) {
        id
    }
 }
`;

function EditArticle() {
   const router = useRouter();
   const { id } = router.query;
   const articleId = parseInt(id);
   const [isModified, setIsModified] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { data, loading, error } = useQuery(GET_ARTICLE, {
       variables: { id: articleId },
       skip: !id
   });

   const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
   const { data: authorsData, loading: authorsLoading, error: authorsError } = useQuery(GET_AUTHORS);
   const [deleteImage] = useMutation(DELETE_IMAGE);
   const [initialImages, setInitialImages] = useState([]);
   const quillRef = useRef(null);
   const [formData, setFormData] = useState({
      title: '',
      content: '',
      categoryId: '',
      authorId: '',
      featured: false,
      published: false,
      images: []
   });

   useEffect(() => {
       if (data && data.getArticleById) {
          const initialImagesData = data.getArticleById.images.map(img => ({
            id: img.id, 
            imageUrl: img.url,
            imageAlt: img.alt
          }));
          setFormData({
              title: data.getArticleById.title,
              content: data.getArticleById.content,
              categoryId: data.getArticleById.category.id,
              authorId: data.getArticleById.author.id,
              featured: data.getArticleById.featured,
              published: data.getArticleById.published,
              images: initialImagesData
          });
          setInitialImages(initialImagesData);
       }
   }, [data]);

   useEffect(() => {
    if (!isSubmitting) {
      return () => {
        formData.images.forEach(img => {
          if (img.imageUrl && img.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(img.imageUrl);
          }
        });
      };
    }
  }, [formData.images, isSubmitting]); 

  useEffect(() => {
    console.log("Current formData.images from useEffect in ArticleEdit:", formData.images);
}, [formData.images]);   

   const [updateArticle, { loading: updating, error: updateError }] = useMutation(UPDATE_ARTICLE, {
       onCompleted: () => alert('Article updated successfully')
   });

  const handleFileChange = (e, index) => {
    setIsModified(true);
    const file = e.target.files[0];
    if (!file) return;

    /*if (formData.images[index] && formData.images[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(formData.images[index].url);
    }*/

    setFormData(oldFormData => {
      const newImages = [...oldFormData.images]; // Create a shallow copy of the images array
      newImages[index] = {
          ...newImages[index],
          file: file,
          imageUrl: URL.createObjectURL(file)
      };
      return { ...oldFormData, images: newImages };
    });
    console.log(formData.images)
  }
    
   const handleFormChange = (e) => {
       const { name, value, type, checked } = e.target;
       setIsModified(true);
       if (type === 'checkbox') {
           setFormData({ ...formData, [name]: checked });
       } else if (name === "categoryId" || name === "authorId") {
        setFormData({ ...formData, [name]: parseInt(value) });
      } else {
           setFormData({ ...formData, [name]: value });
       }
   };

   const handleAltChange = (e, index) => {
    setIsModified(true);
    const altText = e.target.value;
    setFormData(oldFormData => {
        const newImages = oldFormData.images.map((img, idx) => {
            if (idx === index) {
                return {...img, imageAlt: altText};
            }
            return img;
        });
        return {...oldFormData, images: newImages};
    });
  };

  const handleDeleteImage = (index) => {
    setIsModified(true);
    const updatedImages = formData.images.filter((_, idx) => idx !== index);
    setFormData({ ...formData, images: updatedImages });
   };
  
   const handleAddImage = () => {
      setIsModified(true);
      const newImage = { id: null, file: null, imageUrl: null, imageAlt: null };
      setFormData({ ...formData, images: [...formData.images, newImage] });
   };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitting(true);
    try { 
        const quill = quillRef.current.getEditor();
        const delta = quill.getContents();
        console.log("quill content:", delta)
        console.log("handle submit all images:", formData.images)
        const imageUploadPromises = formData.images.filter(img => img.file).map((img) => {
            const uploadFormData = new FormData();
            uploadFormData.append('file', img.file);
            return axios.post('/api/upload', uploadFormData).then(response => {
              console.log("in EditArticle handleSubmit images:", response.data[0].url);
              return { url: response.data[0].url, alt: img.imageAlt, placeholder: img.placeholder
               };
          });
        });
        
        const uploadedImages = await Promise.all(imageUploadPromises);

        const updatedDelta = delta.ops.map(op => {
          console.log("Current operation (op):", op);
          if (op.insert && op.insert.image) {
            const uploadedImage = uploadedImages.find(img => img.placeholder === op.insert.image);
            console.log("Matched uploaded image for placeholder:", op.insert.image, uploadedImage);
            if (uploadedImage) {
              return { insert: { image: uploadedImage.url } };
            }
          }
          return op;
        });
    
        quill.setContents(updatedDelta);
    
        const finalContent = quill.root.innerHTML;

        const existingImages = formData.images.filter(img => !img.file && img.id).map(img => ({
          id: img.id,
          url: img.imageUrl,
          alt: img.imageAlt
        }));
        const allImages = [...uploadedImages, ...existingImages];
        const uniqueImages = allImages.filter((img, index, self) =>
            index === self.findIndex((t) => t.url === img.url)
        );
        const variables = {
            id: articleId,
            title: formData.title,
            content: finalContent,
            categoryId: parseInt(formData.categoryId),
            authorId: parseInt(formData.authorId),
            featured: formData.featured,
            published: formData.published,
            images: allImages.map(img => ({ url: img.url, alt: img.alt })) 
        };
        const response = await updateArticle({ variables });
        if (response.data && response.data.updateArticle) {
            setFormData(oldFormData => ({
                ...oldFormData,
                images: response.data.updateArticle.images.map(img => ({
                  id: img.id,
                  imageUrl: img.imageUrl,
                  imageAlt: img.imageAlt
                }))
            }));
            setIsModified(false);
        } else {
            console.error("No article data returned from the mutation.");
        }
    } catch (error) {
        console.error("Update error:", error);
    } finally {
        setIsLoading(false);
        setIsSubmitting(false);
    }
};
   
   if (categoriesLoading || authorsLoading) return <p>Loading categories and authors...</p>;
   if (categoriesError || authorsError) {
       console.error(categoriesError || authorsError);
       return <p>Error loading categories or authors!</p>;
   }

   if (loading) return <p>Loading...</p>;
   if (error) return <p>Error: {error.message}</p>;

   return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Article</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <ArticleForm 
                  formData={formData} 
                  onChange={handleFormChange} 
                  categoriesData={categoriesData} 
                  authorsData={authorsData} 
                  quillRef={quillRef} 
                  setFormData={setFormData} 
              />
              <ImageManager 
                  images={formData.images} 
                  onFileChange={handleFileChange} 
                  onAltChange={handleAltChange} 
                  onAddImage={handleAddImage} 
                  onDeleteImage={handleDeleteImage} 
              />
              <button type="submit" disabled={!isModified || updating || isLoading} className={styles.submitButton}>Save Changes</button>
            </form>
            <Link href="/admin/articles" className={styles.link}>Back to articles</Link>
        </div>
    );
}

const EditArticlePage = () => (
  <PrivateRoute allowedRoles={['Admin', 'Moderator']}>
    <EditArticle />
  </PrivateRoute>
);

export default EditArticlePage;

/*
<ImageManager 
                  images={formData.images} 
                  onFileChange={handleFileChange} 
                  onAltChange={handleAltChange} 
                  onAddImage={handleAddImage} 
                  onDeleteImage={handleDeleteImage} 
              />
              */