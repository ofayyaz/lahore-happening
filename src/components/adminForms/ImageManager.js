import React from 'react';

export default function ImageManager({ images, onImageChange, onAddImage, onDeleteImage }) {
    return (
        <>
            {images.map((image, index) => (
                <div key={index} className="image-container">
                    <img src={image.imageUrl} alt={image.imageAlt || "No alt text"} className="image-thumbnail" />
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
                    <button onClick={() => onDeleteImage(index)} className="delete-image-btn">Delete</button>
                </div>
            ))}
            <button onClick={onAddImage} className="add-image-btn">Add New Image</button>
        </>
    );
}
