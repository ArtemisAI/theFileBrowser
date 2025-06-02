import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function UploadPage() {
  const [status, setStatus] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const form = new FormData();
    form.append('files', file, file.name);

    try {
      const baseURL = import.meta.env.VITE_API || 'http://localhost:8080';
      await axios.post('/api/upload', form, {
        baseURL,
        params: { override: false },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('✅ Upload successful');
    } catch (err) {
      console.error(err);
      setStatus('❌ Upload failed');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] },
    multiple: false,
  });

  return (
    <div className="page">
      <h1>Upload</h1>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag &amp; drop an audio file here, or click to select one</p>
        )}
      </div>
      {status && <p>{status}</p>}
    </div>
  );
}
