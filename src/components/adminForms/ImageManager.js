import React from 'react';


  
export default function ImageManager({ images, onFileChange, onAltChange, onAddImage, onDeleteImage }) {

    return (
        <>
            {images.map((image, index) => (
                <div key={index} className="image-container mb-4">
                    <img src={image.imageUrl} alt={image.imageAlt || "No alt text"} />
                    <div className="flex justify-between items-center mb-2">
                        <input
                            type="text"
                            value={image.imageUrl}
                            readOnly
                            className="url-input flex-grow mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        />
                        <button type="button" onClick={() => onDeleteImage(index)} className="ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">Delete</button>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor={`alt-${index}`} className="mr-2 text-sm font-medium text-gray-700">Alt Text</label>
                        <input
                            type="text"
                            id={`alt-${index}`}
                            value={image.imageAlt || ''}
                            onChange={(e) => onAltChange(e, index)}
                            placeholder="Alt Text"
                            className="image-alt-input flex-grow mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        />
                    </div>
                </div>
            ))}
            <button type="button" onClick={onAddImage} className="add-image-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-2">Add New Image</button>
        </>
    );
}


