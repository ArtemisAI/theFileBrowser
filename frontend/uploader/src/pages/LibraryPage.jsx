import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function LibraryPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const baseURL = import.meta.env.VITE_API || 'http://localhost:8080';
        const res = await axios.get('/api/files', { baseURL });
        setFiles(res.data.items ?? []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFiles();
  }, []);

  if (!files.length) return <p>No files uploaded yet.</p>;

  return (
    <div className="page">
      <h1>Library</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Modified</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f.name}>
              <td>{f.name}</td>
              <td>{(f.size / 1024).toFixed(1)} KB</td>
              <td>{new Date(f.modified).toLocaleString()}</td>
              <td>
                <a
                  href={`${import.meta.env.VITE_API || 'http://localhost:8080'}/api/raw/${encodeURIComponent(f.path)}`}
                >
                  download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
