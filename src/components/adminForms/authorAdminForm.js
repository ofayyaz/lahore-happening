import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const CREATE_AUTHOR = gql`
  mutation CreateAuthor($name: String!, $bio: String) {
    createAuthor(name: $name, bio: $bio) {
      id
      name
      bio
    }
  }
`;

export default function AuthorAdmin() {
    const [formData, setFormData] = useState({
        name: '',
        bio: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [createAuthor, { loading, error }] = useMutation(CREATE_AUTHOR, {
        onCompleted: () => {
            alert('Author added successfully');
            setFormData({ name: '', bio: '' }); // Reset the form on successful submission
        },
        onError: (error) => {
            alert('Failed to add author');
            console.error("Error creating an author:", error);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createAuthor({
                variables: {
                    name: formData.name,
                    bio: formData.bio
                }
            });
        } catch (err) {
            // Error handling if the mutation itself throws before reaching the server
            alert('Failed to submit author');
            console.error("Error submitting the author:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2>Add New Author</h2>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Author Name" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Author Bio" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" /><br/>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Add Author</button>
        </form>
    );
}
