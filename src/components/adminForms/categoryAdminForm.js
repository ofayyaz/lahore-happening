import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
    }
  }
`;


export default function CategoryAdmin() {
    const [formData, setFormData] = useState({
        name: ''
    });

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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2>Add New Category</h2>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Category Name" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Add Category</button>
        </form>
    );
}
