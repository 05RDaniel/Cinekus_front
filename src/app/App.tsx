import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './shared/components/Header';
import { Footer } from './shared/components/Footer';
import { HomePage } from './features/public/pages/HomePage';
import { HomeAdminPage } from './features/admin/pages/HomeAdminPage';
import { AdminMoviesPage } from './features/admin/pages/AdminMoviesPage';

export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin/home" element={<HomeAdminPage />} />
        <Route path="/admin/movies" element={<AdminMoviesPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
