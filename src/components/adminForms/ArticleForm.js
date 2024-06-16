import React from 'react';

export default function ArticleForm({ formData, onChange, categoriesData, authorsData }) {
    return (
        <>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={onChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                    name="content"
                    id="content"
                    rows="4"
                    value={formData.content}
                    onChange={onChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    name="categoryId"
                    id="category"
                    value={formData.categoryId}
                    onChange={onChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    {categoriesData && categoriesData.allCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author</label>
                <select
                    name="authorId"
                    id="author"
                    value={formData.authorId}
                    onChange={onChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    {authorsData && authorsData.allAuthors.map(author => (
                        <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                </select>
            </div>
               
            <div>
                <label>
                    <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={onChange}
                    />
                    Featured
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={onChange}
                    />
                    Published
                </label>
            </div>
        </>
    );
}
