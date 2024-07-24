import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
//import styles from './CategoryAdmin.module.css';

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
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

export default function CategoryAdmin() {
    const [formData, setFormData] = useState({
        name: ''
    });

    const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch } = useQuery(GET_CATEGORIES);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [createCategory, { loading, error }] = useMutation(CREATE_CATEGORY, {
        onCompleted: () => {
            alert('Category added successfully');
            setFormData({ name: '' }); // Reset form after successful submission
        },
        onError: (error) => {
            alert('Failed to add category');
            console.error("Error creating a category:", error);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCategory({
                variables: formData
            });
        } catch (err) {
            alert('Failed to submit category');
            console.error("Error submitting the category:", err);
        }
    };

    if (categoriesLoading) return <p>Loading categories...</p>;
    if (categoriesError) return <p>Error loading categories: {categoriesError.message}</p>;

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2>Add New Category</h2>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Category Name" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Add Category</button>
            </form>
            <div className="mt-4">
                <label htmlFor="existingCategories" className="block mb-2 text-sm font-medium text-gray-700">
                    Existing Categories
                </label>
                <select
                    id="existingCategories"
                    name="existingCategories"
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                    multiple // Allow multiple selections to disable individual options
                >
                    {categoriesData.allCategories.map(category => (
                        <option key={category.id} value={category.id} disabled>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
