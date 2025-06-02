import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import UploadPage from './pages/UploadPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';

import './styles.css';

function App() {
  return (
    <Router>
      <nav className="nav-bar">
        <NavLink to="/upload">Upload</NavLink>
        <NavLink to="/library">Library</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
