import React from 'react';

export default function ImageManager({ images, onFileChange, onAltChange, onAddImage, onDeleteImage }) {

    return (
        <>
            {images.map((image, index) => (
                <div key={index} className="image-container">
                    
                    <img src={image.imageUrl} alt={image.imageAlt || "No alt text"} className="image-thumbnail" />
                    <button type="button" onClick={() => onDeleteImage(index)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">Delete</button>
                
                    <input
                        type="file"
                        onChange={(e) => onFileChange(e, index)}
                        className="file-input"
                        disabled={!!image.imageUrl}
                    />
                    <input
                        type="text"
                        value={image.imageAlt || ''}
                        onChange={(e) => onAltChange(e, index)}
                        placeholder="Alt Text"
                        className="image-alt-input"
                    />
                    
                </div>
            ))}
            <button type="button" onClick={onAddImage} className="add-image-btn">Add New Image</button>
        </>
    );
}
