import React, { useCallback, useMemo, useEffect,useRef, useState }  from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import 'quill/dist/quill.snow.css'; 
import QuillEditor from 'react-quill';
import ReactQuill from 'react-quill';
import styles from './ArticleForm.module.css';
import axios from 'axios';
import Delta from 'quill-delta';

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
  const currentContentRef = useRef(formData.content);  
  const [imageCounter, setImageCounter] = useState(0);
  const imageCounterRef = useRef(imageCounter);

  const getNextImageCounter = () => {
    const newCounter = imageCounterRef.current + 1;
    imageCounterRef.current = newCounter;
    setImageCounter(newCounter);
    return newCounter;
  };

  const handleImage = useCallback(() => {
        if (typeof window !== 'undefined') {
          //console.log("Image handler called");
          //console.log("document in imageHandler at start:", document.location.href); // Check current URL at start
          //console.log('quillRef.current in ArticleForm handleImage:', quillRef.current); 
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
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
                //quill.insertEmbed(range.index, 'image', placeholderURL);
                const delta = quill.getContents();
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
      if (source === 'user') {
      const currentSelection = quillRef.current.getEditor().getSelection();
      const html = editor.getHTML();
      const event = {
        target: {
          name: 'content',
          value: html
        }
      };
      onChange(event);
      setTimeout(() => {
        if (currentSelection) {
          quillRef.current.getEditor().setSelection(currentSelection.index, currentSelection.length);
        }
        }, 0);
      }
    };

    const handlePaste = useCallback(async (event) => {
      const clipboardData = event.clipboardData || window.clipboardData;
      const pastedData = clipboardData.getData('text/html');
      const quill = quillRef.current.getEditor();
      const delta = quill.clipboard.convert(pastedData);
      
      const promises = delta.ops.map(async (op) => {
        console.log("delta ops in handlePaste:", op)
          if (op.insert && op.insert.image) {
              const url = op.insert.image;
              if (url.startsWith('http')) {
                  try {
                    const response = await axios.get(`/api/fetch-image?url=${encodeURIComponent(url)}`, { responseType: 'blob' });
           
                    const newCounter = getNextImageCounter();
                    const file = new File([response.data], `pasted-image-${newCounter}.jpg`, { type: response.data.type });
                    const blobplaceholderURL = URL.createObjectURL(file);
                    
                      // Log image handling
                      console.log('Handling image:', url);
                      console.log('Blob placeholder URL:', blobplaceholderURL);
  
                      op.insert.image = blobplaceholderURL;
  
                      setFormData(oldFormData => {
                          const newImages = [...oldFormData.images, { file, placeholder: blobplaceholderURL }];
                          console.log('Updated formData.images from handlePaste:', newImages); // Log updated images
                          return {
                              ...oldFormData,
                              images: newImages
                          };
                      });
                  } catch (error) {
                      console.error('Error handling pasted image:', error);
                  }
              }
          }
          return op;
      });
      const processedOps = await Promise.all(promises);
      // Log the processed operations
      console.log('Processed operations:', processedOps);
      const finalDelta = new Delta(processedOps);
      quill.setContents(finalDelta);
      console.log('final Delta written in paste:', finalDelta);
      quillRef.current.getEditor().root.innerHTML = quill.root.innerHTML;
  }, [quillRef, setFormData]);
  
  useEffect(() => {
      if (typeof window !== 'undefined' && quillRef.current && typeof quillRef.current.getEditor === 'function') {
          const quillEditor = quillRef.current.getEditor();
          quillEditor.root.addEventListener('paste', handlePaste);
          try {
              quillEditor.clipboard.dangerouslyPasteHTML(formData.content);
          } catch (error) {
              console.error('Error pasting content:', error);
          }
  
          return () => {
              quillEditor.root.removeEventListener('paste', handlePaste);
          };
      }
  }, [formData.content, quillRef, handlePaste]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && quillRef.current && typeof quillRef.current.getEditor === 'function') {
        const quillEditor = quillRef.current.getEditor();
        quillEditor.root.addEventListener('paste', handlePaste);
        try {
            quillEditor.clipboard.dangerouslyPasteHTML(formData.content);
        } catch (error) {
            console.error('Error pasting content:', error);
        }

        return () => {
            quillEditor.root.removeEventListener('paste', handlePaste);
        };
    }
  }, [formData.content, quillRef, handlePaste]);
    
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
            <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.titleLabel}>Title</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={onChange}
                    required
                    className={styles.inputField}
                />
            </div>
            <div className={styles.formGroupQuill}>
                <label htmlFor="content" className={styles.titleLabel}>Content</label>
                <QuillEditor
                    ref={quillRef}
                    value={formData.content}
                    onChange={handleQuillChange}
                    modules={modules}
                    formats={formats}
                    className={`${styles.quillEditor} ${styles.inputField}`}
                    style={{ height: '500px' }}
                />
            </div>
            <div className={styles.formGroupCategory}>
                <label htmlFor="category" className={styles.titleLabel}>Category</label>
                <select
                    name="categoryId"
                    id="category"
                    value={formData.categoryId}
                    onChange={onChange}
                    required
                    className={styles.selectField}
                >
                    {categoriesData && categoriesData.allCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="author" className={styles.titleLabel}>Author</label>
                <select
                    name="authorId"
                    id="author"
                    value={formData.authorId}
                    onChange={onChange}
                    required
                    className={styles.selectField}
                >
                    {authorsData && authorsData.allAuthors.map(author => (
                        <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                </select>
            </div>
               
            <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={onChange}
                    />
                    Featured
                </label>
                <label className={styles.checkboxLabel}>
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
