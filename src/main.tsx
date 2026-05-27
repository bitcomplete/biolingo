import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { RoadmapPage } from './pages/RoadmapPage';
import './styles.css';

function LessonRoute() {
  const { animal, lessonId } = useParams();
  return <LessonPage key={`${animal}-${lessonId}`} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('root element missing');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lesson/:animal/:lessonId" element={<LessonRoute />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
