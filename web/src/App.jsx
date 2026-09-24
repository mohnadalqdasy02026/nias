import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Programs from './pages/Programs.jsx';
import Training from './pages/Training.jsx';
import TrainingRegister from './pages/TrainingRegister.jsx';
import ProgramDetail from './pages/ProgramDetail.jsx';
import Contact from './pages/Contact.jsx';
import { NewsList, NewsDetail } from './pages/News.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import DownloadsPage from './pages/DownloadsPage.jsx';
import FacultyPage from './pages/FacultyPage.jsx';
import BranchesPage from './pages/BranchesPage.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminContactMessages from './pages/admin/ContactMessages.jsx';
import AdminNews from './pages/admin/NewsAdmin.jsx';
import AdminPages from './pages/admin/PagesAdmin.jsx';
import AdminTrainingCourses from './pages/admin/TrainingCourses.jsx';
import AdminTrainingEnrollments from './pages/admin/TrainingEnrollments.jsx';
import MediaLibrary from './pages/admin/MediaLibrary.jsx';
import ProgramsAdmin from './pages/admin/ProgramsAdmin.jsx';
import UsersAdmin from './pages/admin/UsersAdmin.jsx';
import RolesAdmin from './pages/admin/RolesAdmin.jsx';
import BranchesAdmin from './pages/admin/BranchesAdmin.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:id" element={<ProgramDetail />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="training" element={<Training />} />
            <Route path="training/register" element={<TrainingRegister />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="branches/:slug" element={<BranchesPage />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute permission="dashboard.access">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route
              path="messages"
              element={
                <ProtectedRoute permission="contact_messages.read">
                  <AdminContactMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="content/news"
              element={
                <ProtectedRoute permission="news.read">
                  <AdminNews />
                </ProtectedRoute>
              }
            />
            <Route
              path="content/pages"
              element={
                <ProtectedRoute permission="site_pages.read">
                  <AdminPages />
                </ProtectedRoute>
              }
            />
            <Route
              path="training/courses"
              element={
                <ProtectedRoute permission="training_courses.read">
                  <AdminTrainingCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="training/enrollments"
              element={
                <ProtectedRoute permission="training_enrollments.read">
                  <AdminTrainingEnrollments />
                </ProtectedRoute>
              }
            />
            <Route
              path="media"
              element={
                <ProtectedRoute permission="media_library.read">
                  <MediaLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="programs"
              element={
                <ProtectedRoute permission="academic_programs.read">
                  <ProgramsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute permission="users.view">
                  <UsersAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute permission="roles.manage">
                  <RolesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="branches"
              element={
                <ProtectedRoute permission="branches.read">
                  <BranchesAdmin />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}