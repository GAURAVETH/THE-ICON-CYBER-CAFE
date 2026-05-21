import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({
    children,
    adminOnly = false,
    redirectAdminTo
}) => {
    const {
        user,
        isAuthLoading
    } = useAuth();
    const token = localStorage.getItem("token");

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
                <p className="text-gray-500 font-bold animate-pulse">Checking access...</p>
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    if (redirectAdminTo && user.role === "admin") {
        return <Navigate to={redirectAdminTo} replace />;
    }

    return children;
};

export default PrivateRoute;
