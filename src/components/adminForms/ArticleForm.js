import React, { useCallback, useMemo, useRef, useEffect }  from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import 'quill/dist/quill.snow.css'; 
import quill from 'quill/core/quill';
import QuillEditor from 'react-quill';
import ReactQuill from 'react-quill';

const baseModules = {
    toolbar: {
      container: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ]
   },
    clipboard: {
      matchVisual: false,
    }
  }
  
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];

const ArticleForm = ({ formData, onChange, categoriesData, authorsData, quillRef, setFormData}) => {
    const handleImage = useCallback(() => {
        if (typeof window !== 'undefined') {
          //console.log("Image handler called");
          console.log("document in imageHandler at start:", document.location.href); // Check current URL at start
          //console.log('quillRef.current in ArticleForm handleImage:', quillRef.current); 
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          //input.setAttribute('multiple', 'multiple'); 
          input.click();
    
          input.onchange = () => {
            const file = input.files[0];
            if (file){
              const blobplaceholderURL = URL.createObjectURL(file);
              const placeholderURL = blobplaceholderURL.replace('blob:', '');
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "image", placeholderURL);
              quill.setSelection(range.index + 1);
              // Add the file and its placeholder to formData.images
              setFormData(oldFormData => {
                const newImages = [...oldFormData.images, { file, placeholder: placeholderURL }];
                console.log("newImages array inside state update:", newImages);
                console.log("placeholderURL inside handleImage input.onChange setFormData:", placeholderURL);
                //quill.insertEmbed(range.index, 'image', placeholderURL);
                const delta = quill.getContents();
                console.log("quill content in ArticleForm handleImage:", delta)
                return {
                  ...oldFormData,
                  images: newImages
                };
              })
            };
          }
        }
      }, [quillRef, setFormData]);

    //console.log('quillRef in ArticleForm:', quillRef);
    
    
    const handleQuillChange = (content, delta, source, editor) => {
        const html = editor.getHTML();
        const event = {
          target: {
            name: 'content',
            value: html
          }
        };
        onChange(event);
    };

    useEffect(() => {
        //console.log('quillRef.current in ArticleForm useEffect:', quillRef.current); 
        if (quillRef.current && typeof quillRef.current.getEditor === 'function') {
            const quillEditor = quillRef.current.getEditor();
            //console.log("inside ArticleForm useEffect quillRef editor OK")
            quillEditor.clipboard.dangerouslyPasteHTML(formData.content);
        }
    }, [formData.content, quillRef]);
    
    const modules = useMemo(() => ({
        ...baseModules,
        toolbar: {
          ...baseModules.toolbar,
          handlers: {
            image: handleImage
          }
        }
      }), [handleImage]);

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
                <QuillEditor
                    ref={quillRef}
                    value={formData.content}
                    onChange={handleQuillChange}
                    modules={modules}
                    formats={formats}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          style={{ height: '300px' }}
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

export default ArticleForm;
