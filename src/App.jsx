import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import AddNewPost from "./pages/myposts/AddPost";
import EditPost from "./pages/myposts/EditPost";
import PostDetails from "./pages/myposts/PostDetails";
import PostsHome from "./pages/home";
import NotFound from "./pages/404/NotFound";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Founderseries from "./pages/founderseries/Founderseries";
import Aboutus from "./pages/aboutus/Aboutus";
import Blogpost from "./pages/blogpost/Blogpost";
import Profile from "./pages/profile/Profile";
import NewsletterModal from "./components/NewsletterModal/NewsletterModal";
import AnalyticsTracker from "./components/Analytics/AnalyticsTracker";

// Admin Imports
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import ManagePosts from "./pages/admin/ManagePosts";
import Categories from "./pages/admin/Categories";
import Comments from "./pages/admin/Comments";
import Analytics from "./pages/admin/Analytics";

// Dynamic Imports (Lazy - loading)
const Home = lazy(() => import("./pages/home/Home"));

// Error Boundary FallbackComponent
const ErrorFallback = (props) => {
  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 text-center">
      <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">Something went wrong</h2>
      <pre className="text-red-500 bg-red-50 p-6 rounded-2xl mb-8 font-mono text-sm max-w-xl overflow-auto">{props.error.message}</pre>
      <button
        onClick={props.resetErrorBoundary}
        className="px-8 py-4 bg-[#8C0202] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-950/20"
      >
        Restart Application
      </button>
    </div>
  );
};

const App = () => {
  const navigate = useNavigate();
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        navigate("/");
      }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <AnalyticsTracker />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Home />} />
          <Route path="/posts/:postId" element={<Blogpost />} />
          <Route path="/founderseries" element={<Founderseries />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/aboutus" element={<Aboutus />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/resetPassword" element={<ResetPassword />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="posts" element={<ManagePosts />} />
            <Route path="categories" element={<Categories />} />
            <Route path="comments" element={<Comments />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="create-post" element={<AddNewPost />} />
            <Route path="posts/:postId/edit" element={<EditPost />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Page Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <NewsletterModal />
      </Suspense>
    </ErrorBoundary>
  );
};
export default App;
