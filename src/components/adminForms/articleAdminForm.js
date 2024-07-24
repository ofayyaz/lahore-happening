import { useState, useRef } from 'react';
import { useMutation, useQuery,gql } from '@apollo/client';
import axios from 'axios';
import dynamic from 'next/dynamic';
import styles from './ArticleAdmin.module.css';
import Delta from 'quill-delta';
const ArticleForm = dynamic(() => import('./ArticleForm'), { ssr: false });


const CREATE_ARTICLE = gql`
mutation CreateArticle($title: String!, $content: String!, $categoryId: Int!, $authorId: Int!, $featured: Boolean!, $published: Boolean!, $images: [ImageInput!]) {
    createArticle(title: $title, content: $content, categoryId: $categoryId, authorId: $authorId, featured: $featured, published: $published, images: $images) {
      id
      title
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

export default function ArticleAdmin() {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        images: [],
        categoryId: '',
        authorId: '',
        collectionId: '',
        featured: false,
        published: false
    });

    const quillRef = useRef(null);
    const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
    const { data: authorsData, loading: authorsLoading, error: authorsError } = useQuery(GET_AUTHORS);

    const [createArticle, { data, loading, error }] = useMutation(CREATE_ARTICLE, {
        onCompleted: () => {
            alert('Article added successfully');
            setFormData({
                title: '', content: '', categoryId: '', authorId: '', featured: false, published: false, images: []
            });
        },
        onError: (error) => {
            alert('Failed to add article');
            console.error("Error creating an article:", error);
        }
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(oldFormData => ({
            ...oldFormData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const quill = quillRef.current.getEditor();
          const delta = quill.getContents();
          console.log("quill contents at start of handleSubmit:", delta);
          console.log("all images at start of handleSubmit in formData.images:", formData.images);
          const imageUploadPromises = formData.images.filter(img => img.file).map( (img, index) => {
            const formData = new FormData();
            formData.append('file', img.file);
            return axios.post('/api/upload', formData).then(response => ({
              url: response.data[0].url,
              alt: img.imageAlt,
              placeholder: img.placeholder,
              index
            }));
          });
          const uploadedImages = await Promise.all(imageUploadPromises);
          console.log("uploadedImages after completed promises in handleSubmit:", uploadedImages);
          const updatedDeltaOps = delta.ops.map(op => {
            if (op.insert && op.insert.image) {
              console.log('an image op from quill delta in handleSubmit:', op.insert.image);//this op should be the final delta op
              const uploadedImage = uploadedImages.find(img => img.placeholder === op.insert.image); //this equality isnt firing because op.insert.image in child hasnt been set correctly in handlePaste
              console.log('uploadedImage from handleSubmit:', uploadedImage); // Log updated images
                         
              if (uploadedImage) {
                return { insert: { image: uploadedImage.url } };
              }
            }
          return op;
          });

            const updatedDelta = new Delta(updatedDeltaOps);
            quill.setContents(updatedDelta);

            const finalContent = quill.root.innerHTML;
            
            const imageUrls = uploadedImages.map(img => ({
                url: img.url,
                alt: img.alt
            })).filter(img => img.url !== undefined);;
        
            const categoryId = formData.categoryId ? parseInt(formData.categoryId) : null;
            const authorId = formData.authorId ? parseInt(formData.authorId) : null;
            const collectionId = formData.collectionId ? parseInt(formData.collectionId) : null; // Handle empty string by converting to null

            const variables = {
                title: formData.title,
                content: finalContent,
                categoryId, 
                authorId, 
                featured: formData.featured,
                published: formData.published,
                images: imageUrls,
                collectionId // This will now be null if empty, which should be acceptable if the field is optional
            };

            console.log('Images array being written to the database:', imageUrls);
            console.log('Mutation variables:', variables);
            
            const response = await createArticle({ variables: variables });

            console.log('Article creation response:', response);
        } catch (err) {
            alert('Failed to add article');
            console.error("Error creating an article:", err);
        }
    };

    if (categoriesLoading || authorsLoading) return <p>Loading...</p>;
    if (categoriesError) return <p>Error loading categories: {categoriesError.message}</p>;
    if (authorsError) return <p>Error loading authors: {authorsError.message}</p>;

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2 className={styles.title}>Create New Article</h2>
            <ArticleForm
                formData={formData}
                onChange={handleInputChange}
                categoriesData={categoriesData}
                authorsData={authorsData}
                quillRef={quillRef}
                setFormData={setFormData}
            />
            <button type="submit" disabled={loading} className={styles.button}>Add Article</button>
        </form>
    );
}