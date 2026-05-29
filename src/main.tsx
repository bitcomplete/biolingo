import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LanguageSelectPage } from './pages/LanguageSelectPage';
import './styles.css';

function LessonRoute() {
  const { animal, lessonId } = useParams();
  return <LessonPage key={`${animal}-${lessonId}`} />;
}

function RootRoute() {
  let onboarded = false;
  try {
    onboarded = localStorage.getItem('biolingo_onboarded') === '1';
  } catch {
    onboarded = false;
  }
  return onboarded ? <HomePage /> : <Navigate to="/onboarding" replace />;
}

const root = document.getElementById('root');
if (!root) throw new Error('root element missing');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/select" element={<LanguageSelectPage />} />
        <Route path="/lesson/:animal/:lessonId" element={<LessonRoute />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
