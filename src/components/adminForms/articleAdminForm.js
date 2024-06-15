import { useState } from 'react';
import { useMutation, useQuery,gql } from '@apollo/client';

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
        images: [{ imageUrl: '', imageAlt: '' }],
        categoryId: '',
        authorId: '',
        collectionId: '',
        featured: false,
        published: false
    });

    const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
    const { data: authorsData, loading: authorsLoading, error: authorsError } = useQuery(GET_AUTHORS);

    const handleChange = (e,index = null) => {
        const { name, value, type, checked } = e.target;
        if (name.includes("imageUrl") || name.includes("imageAlt")) {
            const newImages = [...formData.images];
            const field = name.includes("imageUrl") ? "imageUrl" : "imageAlt";
            newImages[index][field] = value;
            setFormData({ ...formData, images: newImages });
        } else {
            setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });}
    };


    const [createArticle, { data, loading, error }] = useMutation(CREATE_ARTICLE, {
        onCompleted: () => {
            alert('Article added successfully');
            setFormData({
                title: '', content: '', categoryId: '', authorId: '', featured: false, published: false, images: [{ imageUrl: '', imageAlt: '' }]
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
            images: [...formData.images, { imageUrl: '', imageAlt: '' }]
        });
    };
    
    const handleRemoveImage = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({
            ...formData,
            images: newImages
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const filteredImages = formData.images.filter(image => image.imageUrl.trim() !== '');
        try {
            const categoryId = formData.categoryId ? parseInt(formData.categoryId) : null;
            const authorId = formData.authorId ? parseInt(formData.authorId) : null;
            const collectionId = formData.collectionId ? parseInt(formData.collectionId) : null; // Handle empty string by converting to null

            const variables = {
                title: formData.title,
                content: formData.content,
                categoryId, // Ensure this is either a valid integer or null
                authorId, // Ensure this is either a valid integer or null
                featured: formData.featured,
                published: formData.published,
                images: filteredImages.map(image => ({
                    url: image.imageUrl,
                    alt: image.imageAlt || undefined // Use undefined for no alt text
                })),
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
        <>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2>Add New Article</h2>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
                <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Content" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
                {formData.images.map((image, index) => (
                    <div key={index}>
                        <input type="text" name="imageUrl" value={image.imageUrl} onChange={(e) => handleChange(e, index)} placeholder="Image URL" className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
                        <input type="text" name="imageAlt" value={image.imageAlt} onChange={(e) => handleChange(e, index)} placeholder="Image Alt Text" className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
                        <button type="button" onClick={() => handleRemoveImage(index)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">Remove</button>
                    </div>
                ))}

                <button type="button" onClick={handleAddImage} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700">Add Image</button><br/>
                
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50">
                    <option value="">Select a Category</option>
                    {categoriesData?.allCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                
                <select name="authorId" value={formData.authorId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50">
                    <option value="">Select an Author</option>
                    {authorsData?.allAuthors.map((author) => (
                        <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                </select><br/> 
                
                <label>
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                    Featured
                </label><br/>
                
                <label>
                    <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} />
                    Published
                </label><br/>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Add Article</button>
            </form>
        </>
    )
}
