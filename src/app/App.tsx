import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './shared/components/layout/Header';
import { Footer } from './shared/components/layout/Footer';
import { PageContainer } from './shared/components/layout/PageContainer';
import { HomePage } from './public/pages/home/HomePage';
import { CarteleraPage } from './public/pages/cartelera/CarteleraPage';
import { MovieDetailPage } from './public/pages/cartelera/MovieDetailPage';
import { BookingSeatsPage } from './public/pages/booking/BookingSeatsPage';
import { LoginPage } from './auth/pages/LoginPage';
import { RegisterPage } from './auth/pages/RegisterPage';
import { AdminRoute } from './auth/components/AdminRoute';
import { HomeAdminPage } from './private/admin/pages/home/HomeAdminPage';
import { AdminMoviesPage } from './private/admin/pages/movies/AdminMoviesPage';
import { AdminSessionsPage } from './private/admin/pages/sessions/AdminSessionsPage';
import { AdminRoomsPage } from './private/admin/pages/rooms/AdminRoomsPage';
import { AdminUsersPage } from './private/admin/pages/users/AdminUsersPage';
import { AdminBookingsPage } from './private/admin/pages/bookings/AdminBookingsPage';

export function App() {
  return (
    <>
      <Header />
      <PageContainer>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/cartelera/:movieId" element={<MovieDetailPage />} />
          <Route path="/cartelera" element={<CarteleraPage />} />
          <Route path="/reservar/:sessionId" element={<BookingSeatsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin/home"
            element={
              <AdminRoute>
                <HomeAdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/movies"
            element={
              <AdminRoute>
                <AdminMoviesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <AdminRoute>
                <AdminSessionsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <AdminRoute>
                <AdminRoomsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminBookingsPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </PageContainer>
      <Footer />
    </>
  );
}
