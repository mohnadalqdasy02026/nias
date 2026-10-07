import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import StaticPage from './pages/StaticPage.jsx';
import Programs from './pages/Programs.jsx';
import Training from './pages/Training.jsx';
import TrainingDetail from './pages/TrainingDetail.jsx';
import TrainingRegister from './pages/TrainingRegister.jsx';
import ProgramDetail from './pages/ProgramDetail.jsx';
import Contact from './pages/Contact.jsx';
import { NewsList, NewsDetail } from './pages/News.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import DownloadsPage from './pages/DownloadsPage.jsx';
import FacultyPage from './pages/FacultyPage.jsx';
import CollegeDetail from './pages/CollegeDetail.jsx';
import CollegesList from './pages/CollegesList.jsx';
import DepartmentDetail from './pages/DepartmentDetail.jsx';
import BranchesPage from './pages/BranchesPage.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import AdminNews, { NewsForm } from './pages/admin/NewsAdmin.jsx';
import AdminPages, { PageForm } from './pages/admin/PagesAdmin.jsx';
import AdminTrainingCourses, { CourseForm } from './pages/admin/TrainingCourses.jsx';
import AdminTrainingEnrollments from './pages/admin/TrainingEnrollments.jsx';
import ProgramsAdmin, { ProgramForm } from './pages/admin/ProgramsAdmin.jsx';
import UsersAdmin, { UserForm } from './pages/admin/UsersAdmin.jsx';
import RolesAdmin, { RoleForm } from './pages/admin/RolesAdmin.jsx';
import ContactMessages from './pages/admin/ContactMessages.jsx';
import BranchesAdmin, { BranchForm } from './pages/admin/BranchesAdmin.jsx';
import CollegesAdmin, { CollegeForm } from './pages/admin/CollegesAdmin.jsx';
import DepartmentsAdmin, { DepartmentForm } from './pages/admin/DepartmentsAdmin.jsx';
import FacultyAdmin, { FacultyForm } from './pages/admin/FacultyAdmin.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route
              path="terms"
              element={
                <StaticPage
                  slug="terms"
                  fallbackTitle="الشروط والأحكام"
                  metaTitle="الشروط والأحكام"
                  metaDescription="شروط وأحكام استخدام موقع المعهد الوطني للعلوم الإدارية."
                />
              }
            />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:id" element={<ProgramDetail />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="training" element={<Training />} />
            <Route path="training/register" element={<TrainingRegister />} />
            <Route path="training/:id" element={<TrainingDetail />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="branches/:slug" element={<BranchesPage />} />
            <Route path="colleges" element={<CollegesList />} />
            <Route path="colleges/:id" element={<CollegeDetail />} />
            <Route path="departments/:id" element={<DepartmentDetail />} />
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
              path="content/news"
              element={
                <ProtectedRoute permission="news.read">
                  <AdminNews />
                </ProtectedRoute>
              }
            />
            <Route
              path="content/news/new"
              element={
                <ProtectedRoute permission="news.create">
                  <NewsForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="content/news/:id"
              element={
                <ProtectedRoute permission="news.update">
                  <NewsForm />
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
              path="content/pages/new"
              element={
                <ProtectedRoute permission="site_pages.create">
                  <PageForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="content/pages/:id"
              element={
                <ProtectedRoute permission="site_pages.update">
                  <PageForm />
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
              path="training/courses/new"
              element={
                <ProtectedRoute permission="training_courses.create">
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="training/courses/:id"
              element={
                <ProtectedRoute permission="training_courses.update">
                  <CourseForm />
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
              path="programs"
              element={
                <ProtectedRoute permission="academic_programs.read">
                  <ProgramsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="programs/new"
              element={
                <ProtectedRoute permission="academic_programs.create">
                  <ProgramForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="programs/:id"
              element={
                <ProtectedRoute permission="academic_programs.update">
                  <ProgramForm />
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
              path="users/new"
              element={
                <ProtectedRoute permission="users.manage">
                  <UserForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/:id"
              element={
                <ProtectedRoute permission="users.manage">
                  <UserForm />
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
              path="roles/new"
              element={
                <ProtectedRoute permission="roles.manage">
                  <RoleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles/:id"
              element={
                <ProtectedRoute permission="roles.manage">
                  <RoleForm />
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
            <Route
              path="branches/:id"
              element={
                <ProtectedRoute permission="branches.manage">
                  <BranchForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute permission="contact_messages.read">
                  <ContactMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="colleges"
              element={
                <ProtectedRoute permission="colleges.read">
                  <CollegesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="colleges/new"
              element={
                <ProtectedRoute permission="colleges.manage">
                  <CollegeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="colleges/:id"
              element={
                <ProtectedRoute permission="colleges.manage">
                  <CollegeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments"
              element={
                <ProtectedRoute permission="colleges.read">
                  <DepartmentsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments/new"
              element={
                <ProtectedRoute permission="colleges.manage">
                  <DepartmentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments/:id"
              element={
                <ProtectedRoute permission="colleges.manage">
                  <DepartmentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="faculty"
              element={
                <ProtectedRoute permission="faculty_members.read">
                  <FacultyAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="faculty/new"
              element={
                <ProtectedRoute permission="faculty_members.create">
                  <FacultyForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="faculty/:id"
              element={
                <ProtectedRoute permission="faculty_members.update">
                  <FacultyForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/site"
              element={
                <ProtectedRoute permission="site_settings.read">
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}