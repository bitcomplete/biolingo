import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { RoadmapPage } from './pages/RoadmapPage';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('root element missing');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
