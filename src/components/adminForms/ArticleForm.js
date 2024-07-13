import React, { useCallback, useMemo, useEffect,useRef }  from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import 'quill/dist/quill.snow.css'; 
import QuillEditor from 'react-quill';
import ReactQuill from 'react-quill';
import styles from './ArticleForm.module.css';

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

    useEffect(() => {
        //console.log('quillRef.current in ArticleForm useEffect:', quillRef.current); 
        if (typeof window !== 'undefined' && quillRef.current && typeof quillRef.current.getEditor === 'function') {
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
