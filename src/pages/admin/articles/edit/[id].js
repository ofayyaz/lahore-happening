// pages/admin/articles/edit/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, gql } from '@apollo/client';
import Link from 'next/link';
import styles from './EditArticle.module.css';
import ArticleForm from '../../../../components/adminForms/ArticleForm';
import ImageManager from '../../../../components/adminForms/ImageManager';


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
   }
 }
`;


export default function EditArticle() {
   const router = useRouter();
   const { id } = router.query;
   const articleId = parseInt(id);


   const { data, loading, error } = useQuery(GET_ARTICLE, {
       variables: { id: articleId },
       skip: !id
   });

   const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
   const { data: authorsData, loading: authorsLoading, error: authorsError } = useQuery(GET_AUTHORS);
   

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
           setFormData({
               title: data.getArticleById.title,
               content: data.getArticleById.content,
               categoryId: data.getArticleById.category.id,
               authorId: data.getArticleById.author.id,
               featured: data.getArticleById.featured,
               published: data.getArticleById.published,
               images: data.getArticleById.images.map(img => ({
                   imageUrl: img.url,
                   imageAlt: img.alt
               }))
           });
       }
   }, [data]);


   const [updateArticle, { loading: updating, error: updateError }] = useMutation(UPDATE_ARTICLE, {
       onCompleted: () => alert('Article updated successfully')
   });


   const handleChange = (e, index) => {
       const { name, value, type, checked } = e.target;
       if (type === 'checkbox') {
           setFormData({ ...formData, [name]: checked });
       } else if (name === "imageUrl" || name === "imageAlt") {
           const newImages = [...formData.images];
           const field = name === "imageUrl" ? "imageUrl" : "imageAlt";
           newImages[index][field] = value;
           setFormData({ ...formData, images: newImages });
       } else {
           setFormData({ ...formData, [name]: value });
       }
   };


   const handleSubmit = (e) => {
       e.preventDefault();
       const variables = {
           id: articleId,
           title: formData.title,
           content: formData.content,
           categoryId: parseInt(formData.categoryId),
           authorId: parseInt(formData.authorId),
           featured: formData.featured,
           published: formData.published,
           images: formData.images.map(img => ({
               url: img.imageUrl,
               alt: img.imageAlt || ''
           }))
       };

       updateArticle({ variables }).then(() => {
            console.log("Update completed");
        }).catch(error => {
            console.error("Update error:", error);
        });
   };


   const handleDeleteImage = (index) => {
       const updatedImages = formData.images.filter((_, idx) => idx !== index);
       setFormData({ ...formData, images: updatedImages });
   };
  
   // Include a function to handle adding new images
   const handleAddImage = () => {
       const newImage = { imageUrl: '', imageAlt: '' };
       setFormData({ ...formData, images: [...formData.images, newImage] });
   };


   if (categoriesLoading || authorsLoading) return <p>Loading categories and authors...</p>;
   if (categoriesError || authorsError) {
       console.error(categoriesError || authorsError);
       return <p>Error loading categories or authorrs!</p>;
   }


   if (loading) return <p>Loading...</p>;
   if (error) return <p>Error: {error.message}</p>;


   return (

        <div className={styles.container}>
            <h1 className={styles.title}>Edit Article</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <ArticleForm formData={formData} onChange={handleChange} categoriesData={categoriesData} authorsData={authorsData} />
                <ImageManager images={formData.images} onImageChange={handleChange} onAddImage={handleAddImage} onDeleteImage={handleDeleteImage} />
                <button type="submit" disabled={updating} className={styles.submitButton}>Save Changes</button>
            </form>
            <Link href="/admin/articles" className={styles.link}>Back to articles</Link>
        </div>
    );
   
}



