import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { lazy, Suspense } from 'react';

// Public features
const HomePage = lazy(() => import('./features/catalog/HomePage'));
const MapView = lazy(() => import('./features/catalog/MapView'));
const BusinessDetail = lazy(() => import('./features/business/BusinessDetail'));
const ListBusinessPage = lazy(() => import('./features/business/ListBusinessPage'));
const TermsPage = lazy(() => import('./features/catalog/TermsPage'));
const PrivacyPage = lazy(() => import('./features/catalog/PrivacyPage'));
const NewsGrid = lazy(() => import('./features/news/NewsGrid'));
const NewsDetail = lazy(() => import('./features/news/NewsDetail'));

// Auth
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./features/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'));

// Entrepreneur dashboard
const EntrepreneurDashboard = lazy(() => import('./features/entrepreneur/Dashboard'));
const EditBusiness = lazy(() => import('./features/entrepreneur/EditBusiness'));
const MyReviews = lazy(() => import('./features/entrepreneur/MyReviews'));

// Admin
const AdminLayout = lazy(() => import('./features/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./features/admin/DashboardPage'));
const BusinessesTable = lazy(() => import('./features/admin/BusinessesTable'));
const ReviewsTable = lazy(() => import('./features/admin/ReviewsTable'));
const UsersTable = lazy(() => import('./features/admin/UsersTable'));
const NewsPage = lazy(() => import('./features/admin/NewsPage'));
const LegalEditor = lazy(() => import('./features/admin/LegalEditor'));
const ConfigPanel = lazy(() => import('./features/admin/ConfigPanel'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const PlanesPage = () => <div className="p-12 text-center text-gray-500 text-lg">Plan Pro — próximamente</div>;
const NotFound = () => (
  <AppLayout>
    <div className="p-12 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-500">Página no encontrada</p>
    </div>
  </AppLayout>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Públicas con AppLayout */}
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/mapa" element={<AppLayout hideFooter><MapView /></AppLayout>} />
            <Route path="/emprendimiento/:slug" element={<AppLayout><BusinessDetail /></AppLayout>} />
            <Route path="/inscribir" element={<AppLayout><ListBusinessPage /></AppLayout>} />
            <Route path="/terminos" element={<AppLayout><TermsPage /></AppLayout>} />
            <Route path="/privacidad" element={<AppLayout><PrivacyPage /></AppLayout>} />
            <Route path="/planes" element={<AppLayout><PlanesPage /></AppLayout>} />
            <Route path="/noticias" element={<AppLayout><NewsGrid /></AppLayout>} />
            <Route path="/noticias/:slug" element={<AppLayout><NewsDetail /></AppLayout>} />

            {/* Auth (sin AppLayout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/verificar-email" element={<VerifyEmailPage />} />
            <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Emprendedor — requiere login */}
            <Route path="/mi-negocio" element={
              <ProtectedRoute><AppLayout><EntrepreneurDashboard /></AppLayout></ProtectedRoute>
            } />
            <Route path="/mi-negocio/editar/:businessId" element={
              <ProtectedRoute><AppLayout><EditBusiness /></AppLayout></ProtectedRoute>
            } />
            <Route path="/mi-negocio/resenas/:businessId" element={
              <ProtectedRoute><AppLayout><MyReviews /></AppLayout></ProtectedRoute>
            } />

            {/* Admin — requiere role admin */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="emprendimientos" element={<BusinessesTable />} />
              <Route path="resenas" element={<ReviewsTable />} />
              <Route path="usuarios" element={<UsersTable />} />
              <Route path="noticias" element={<NewsPage />} />
              <Route path="legal" element={<LegalEditor />} />
              <Route path="configuracion" element={<ConfigPanel />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}