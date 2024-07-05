import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import React, { useEffect }  from 'react';


const QuillEditor = ({ value, onChange, modules, formats, quillRef }) => {
  useEffect(() => {
    if (quillRef.current && typeof quillRef.current.getEditor === 'function') {
      const quillEditor = quillRef.current.getEditor();
      quillEditor.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value, quillRef]);

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
      style={{ height: '300px' }}
    />
  );
};

export default QuillEditor
