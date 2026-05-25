import {
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Notifications from "./pages/Notifications";
import Blogs from "./pages/Blogs";
import Profile from "./pages/Profile";

import PrivateRoute
  from "./routes/PrivateRoute";

const App = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const escapeAttemptsRef = useRef(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    // Global enforcement: If user is logged in, has NO phone number, and navigates away from /profile
    // We ignore auth paths to allow the login/register components to handle their own redirects first
    const authPaths = ["/login", "/register"];
    if (user && !user.phone && location.pathname !== "/profile" && !authPaths.includes(location.pathname)) {
      if (escapeAttemptsRef.current === 0) {
        escapeAttemptsRef.current = 1;
        setPopupMessage("Please write your phone number. It is mandatory to continue.");
        setShowPopup(true);
        navigate("/profile", { replace: true });
        setTimeout(() => setShowPopup(false), 5000);
      } else if (escapeAttemptsRef.current === 1) {
        escapeAttemptsRef.current = 2;
        setPopupMessage("Final warning: Please provide your phone number, otherwise you will be logged out!");
        setShowPopup(true);
        navigate("/profile", { replace: true });
        setTimeout(() => setShowPopup(false), 5000);
      } else {
        escapeAttemptsRef.current = 0;
        setShowPopup(false);
        logout();
        navigate("/login");
      }
    }
  }, [user, location.pathname, logout, navigate]);

  // Reset escape attempts if they provide a phone number
  useEffect(() => {
    if (user && user.phone) {
      escapeAttemptsRef.current = 0;
      setShowPopup(false);
    }
  }, [user?.phone]);

  return (

    <div className="flex flex-col min-h-screen relative">
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-2 max-w-md w-[90%] text-center border-4 border-red-700"
          >
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="font-black text-xl">Action Required</div>
            </div>
            <p className="text-sm font-semibold">{popupMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-grow">
        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Signup />}
          />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute redirectAdminTo="/admin">
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <Booking />
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/blogs"
            element={<Blogs />}
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

        </Routes>
      </main>

      <Footer />

    </div>
  );
};

export default App;
