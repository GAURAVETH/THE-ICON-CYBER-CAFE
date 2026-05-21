import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const getDashboardPath = (nextUser) =>
        nextUser?.role === "admin" ? "/admin" : "/dashboard";

    // Handle standard Email/Password Registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const { data } = await API.post("/auth/register", form);
            const nextUser = login(data.data);
            navigate(getDashboardPath(nextUser), { replace: true });

        } catch (error) {
            console.log(error);
            setErrorMsg(
                error.response?.data?.message || "Registration failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Google Signup/Login
    const signupWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            setErrorMsg("");

            try {
                // Send the Google token to your backend
                // Your backend will create a new account for them and send back a JWT
                const { data } = await API.post("/auth/google", {
                    token: tokenResponse.access_token
                });

                // Log them in immediately and bypass the login screen
                const nextUser = login(data.data);
                navigate(getDashboardPath(nextUser), { replace: true });

            } catch (error) {
                console.error("Backend Auth Error:", error);
                setErrorMsg("Failed to authenticate with our server.");
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: (error) => {
            console.log("Google Signup Failed:", error);
            setErrorMsg("Google sign-in was closed or failed.");
        }
    });

    // Handle all input changes dynamically
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#fafbfc] dark:bg-gray-900 px-4 relative overflow-hidden py-10">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 dark:border-gray-700">

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="bg-[#0b132b] w-12 h-12 rounded-xl mx-auto flex justify-center items-center mb-4">
                            <div className="w-5 h-5 border-2 border-orange-500 transform rotate-45"></div>
                        </div>
                        <h2 className="text-3xl font-black text-[#0b132b] dark:text-white">Create Account</h2>
                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2 text-sm">
                            Join Icon Cyber Cafe to book and track services.
                        </p>
                    </div>

                    {/* Error Message Display */}
                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                required
                                value={form.name}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[#0b132b] dark:text-white px-4 py-3.5 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[#0b132b] dark:text-white px-4 py-3.5 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="********"
                                required
                                value={form.password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[#0b132b] dark:text-white px-4 py-3.5 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="********"
                                required
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[#0b132b] dark:text-white px-4 py-3.5 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading || isGoogleLoading}
                            className={`w-full mt-4 bg-[#0b132b] hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-gray-900/20 transition-all flex justify-center items-center gap-2 ${isLoading || isGoogleLoading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                "Create Account"
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm font-medium">OR</span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>

                    {/* Google Signup Button */}
                    <motion.button
                        type="button"
                        onClick={() => signupWithGoogle()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading || isGoogleLoading}
                        className={`w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900 hover:border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 px-8 rounded-xl shadow-sm transition-all flex justify-center items-center gap-3 ${isLoading || isGoogleLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {isGoogleLoading ? (
                            <svg className="animate-spin h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </>
                        )}
                    </motion.button>

                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#0b132b] dark:text-white font-bold hover:underline">
                        Log in here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
