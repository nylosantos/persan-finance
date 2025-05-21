// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { MonthlyView } from '../components/Financial/MonthlyView';
import { DashboardPage } from '../pages/DashboardPage';
import { DocumentPage } from '../pages/DocumentPage';
import { HomeDashboard } from '../pages/HomeDashboard';
// ... import outras pages quando existirem

export const AppRoutes: React.FC = () => (
  <Routes>
    {/* Rotas públicas */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Rotas protegidas */}
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<HomeDashboard />} />
      <Route path="/monthlyView" element={<MonthlyView />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/documents/:type" element={<DocumentPage />} />
    </Route>

    {/* Redirecionamento padrão */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);
