import React from 'react';
import axios from 'axios';

export default function ImageManager({ images, setImages, onAddImage, onDeleteImage }) {
    const handleFileChange = (e, index) => {
        const newFiles = [...images];
        newFiles[index] = {
            ...newFiles[index],
            file: e.target.files[0],
            imageUrl: URL.createObjectURL(e.target.files[0]), // This creates a local URL to preview the image
        };
        setImages(newFiles);
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post('/api/upload', formData);
            return response.data.url; // Assuming the server returns the URL of the uploaded image
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleImageUpload = async (index) => {
        const imageUrl = await uploadImage(images[index].file);
        const newImages = [...images];
        newImages[index] = { ...newImages[index], imageUrl };
        setImages(newImages);
    };
    
    return (
        <>
            {images.map((image, index) => (
                <div key={index} className="image-container">
                    <img src={image.imageUrl} alt={image.imageAlt || "No alt text"} className="image-thumbnail" />
                    <button onClick={() => onDeleteImage(index)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">Delete</button>
                    <input
                        type="text"
                        value={image.imageUrl}
                        onChange={(e) => onImageChange(e, index)}
                        placeholder="Image URL"
                        className="image-url-input"
                    />
                    <input
                        type="text"
                        value={image.imageAlt}
                        onChange={(e) => onImageChange(e, index)}
                        placeholder="Alt Text"
                        className="image-alt-input"
                    />
                    
                </div>
            ))}
            <button onClick={onAddImage} className="add-image-btn">Add New Image</button>
        </>
    );
}
