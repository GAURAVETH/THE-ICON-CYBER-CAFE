import {
  Routes,
  Route
} from "react-router-dom";

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
import Profile from "./pages/Profile";

import PrivateRoute
  from "./routes/PrivateRoute";

const App = () => {

  return (

    <div className="flex flex-col min-h-screen">

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
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
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
