import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">Customer Dashboard</p>
                        <h1 className="text-3xl md:text-4xl font-black text-[#0b132b] dark:text-white tracking-tight mt-3">Welcome back, {user?.name || "Customer"}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-2xl">
                            Review your account details and keep track of your next actions. New service requests are handled from the Services page.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/services" className="bg-orange-500 hover:bg-orange-600 text-[#0b132b] font-black py-3 px-6 rounded-xl shadow-lg transition-all text-center">
                            Browse Services
                        </Link>
                        <Link to="/profile" className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0b132b] dark:text-white font-black py-3 px-6 rounded-xl shadow-sm transition-all text-center">
                            Update Profile
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">Profile Snapshot</p>
                                <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">Account details</h2>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">Verified</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
                                <p className="text-xs font-black uppercase text-gray-400">Name</p>
                                <p className="mt-2 font-bold text-[#0b132b] dark:text-white">{user?.name || "Not provided"}</p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
                                <p className="text-xs font-black uppercase text-gray-400">Mobile</p>
                                <p className="mt-2 font-bold text-[#0b132b] dark:text-white">{user?.phone || "Update in profile"}</p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
                                <p className="text-xs font-black uppercase text-gray-400">Email</p>
                                <p className="mt-2 font-bold text-[#0b132b] dark:text-white">{user?.email || "Not provided"}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">Request overview</p>
                        <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">Quick status snapshot</h2>
                        <div className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center justify-between"><span>Advance payment</span><span className="font-black text-emerald-600">50%</span></div>
                            <div className="flex items-center justify-between"><span>Admin verification</span><span className="font-black text-orange-500">After submission</span></div>
                            <div className="flex items-center justify-between"><span>Next action</span><span className="font-black text-[#0b132b] dark:text-white">Browse services</span></div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                        <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">Customer shortcuts</p>
                        <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">What you can do now</h2>
                        <div className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <Link to="/services" className="block rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 font-bold text-[#0b132b] dark:text-white hover:border-orange-500 transition-all">
                                Explore available services
                            </Link>
                            <Link to="/profile" className="block rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 font-bold text-[#0b132b] dark:text-white hover:border-orange-500 transition-all">
                                Update your contact details
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                        <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">More info</p>
                        <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">Explore updates</h2>
                        <div className="mt-5 grid grid-cols-1 gap-3">
                            <Link to="/notifications" className="block rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm font-bold text-[#0b132b] dark:text-white hover:border-orange-500 transition-all">
                                Latest jobs & new hiring updates
                            </Link>
                            <Link to="/blogs" className="block rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm font-bold text-[#0b132b] dark:text-white hover:border-orange-500 transition-all">
                                Read the latest blog posts
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
