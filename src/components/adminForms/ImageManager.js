import React from 'react';

export default function ImageManager({ images, setImages, onAddImage, onDeleteImage }) {
    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const newImages = [...images];
        newImages[index] = {
            ...newImages[index],
            file: file,  // Store file for upload on form submission
            imageUrl: URL.createObjectURL(file) // Preview URL
        };
        setImages(newImages);
    };    

    return (
        <>
            {images.map((image, index) => (
                <div key={index} className="image-container">
                    <img src={image.imageUrl} alt={image.imageAlt || "No alt text"} className="image-thumbnail" />
                    <button onClick={() => onDeleteImage(index)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">Delete</button>
                    <input
                        type="file"
                        onChange={(e) => handleFileChange(e, index)}
                        className="file-input"
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
            <button type="button" onClick={onAddImage} className="add-image-btn">Add New Image</button>
        </>
    );
}
