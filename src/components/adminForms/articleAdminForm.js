import { useState } from 'react';
import { useMutation, useQuery,gql } from '@apollo/client';
import axios from 'axios';
import styles from './ArticleAdmin.module.css';

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
    
    const handleAddImage = () => {
        setFormData({
            ...formData,
            images: [...formData.images, { file: null, imageUrl: '', imageAlt: '' }]
        });
    };
    
    const handleRemoveImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleFileChange = (file, index) => {
        const newImages = [...formData.images];
        newImages[index].file = file;
        newImages[index].imageUrl = URL.createObjectURL(file);
        setFormData({ ...formData, images: newImages });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const imageUploadPromises = formData.images.filter(img => img.file).map( (img, index) => {
                const formData = new FormData();
                formData.append('file', img.file);
                return axios.post('/api/upload', formData).then(response => ({ response: response, index: index }));
                });
            const imageResponses = await Promise.all(imageUploadPromises);
            const imageUrls = imageResponses.map(res => ({
                url: res.response.data[0].url,
                alt: formData.images[res.index].imageAlt
            }));
        
            const categoryId = formData.categoryId ? parseInt(formData.categoryId) : null;
            const authorId = formData.authorId ? parseInt(formData.authorId) : null;
            const collectionId = formData.collectionId ? parseInt(formData.collectionId) : null; // Handle empty string by converting to null

            const variables = {
                title: formData.title,
                content: formData.content,
                categoryId, 
                authorId, 
                featured: formData.featured,
                published: formData.published,
                images: imageUrls,
                collectionId // This will now be null if empty, which should be acceptable if the field is optional
            };

            console.log('Submitting with data:', variables);
            
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
            <h2 className={styles.title}>Add New Article</h2>
            <input type="text" className={styles.inputField} name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Title" required />
            <textarea className={styles.textAreaField} name="content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Content" required />
            {formData.images.map((image, index) => (
                <div key={index} className={styles.imageInputContainer}>
                    <input type="file" onChange={(e) => handleFileChange(e.target.files[0], index)} />
                    <input type="text" className={styles.imageAltInput} value={image.imageAlt} onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index].imageAlt = e.target.value;
                        setFormData({...formData, images: newImages});
                    }} placeholder="Image Alt Text" />
                    <button type="button" onClick={() => handleRemoveImage(index)} className={`${styles.button} ${styles.imageRemoveButton}`}>Remove</button>
                </div>
            ))}
            <button type="button" onClick={handleAddImage} className={styles.button}>Add Image</button>
            <select className={styles.selectField} name="categoryId" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} required>
                <option value="">Select a Category</option>
                {categoriesData?.allCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
            <select className={styles.selectField} name="authorId" value={formData.authorId} onChange={(e) => setFormData({...formData, authorId: e.target.value})} required>
                <option value="">Select an Author</option>
                {authorsData?.allAuthors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                ))}
            </select>
            <label className={styles.checkboxLabel}>
                <input type="checkbox" name="featured" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} />
                Featured
            </label>
            <label className={styles.checkboxLabel}>
                <input type="checkbox" name="published" checked={formData.published} onChange={(e) => setFormData({...formData, published: e.target.checked})} />
                Published
            </label>
            <button type="submit" disabled={loading} className={styles.button}>Add Article</button>
        </form>
    );
}
