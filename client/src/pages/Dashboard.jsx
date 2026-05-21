import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchTasks = async () => {
            try {
                const { data } = await API.get("/tasks");

                if (isMounted) {
                    setTasks(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchTasks();

        return () => {
            isMounted = false;
        };
    }, []);

    const getStatusStyles = (status) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("completed") || s.includes("done")) return "bg-green-100 text-green-700 border-green-200";
        if (s.includes("pending") || s.includes("waiting")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        if (s.includes("progress") || s.includes("active")) return "bg-blue-100 text-blue-700 border-blue-200";
        return "bg-gray-100 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#0b132b] dark:text-white tracking-tight">Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2 font-medium">Welcome back, <span className="text-[#0b132b] dark:text-white font-bold">{user?.name || "User"}</span>.</p>
                    </div>
                    <Link to="/services" className="bg-orange-500 hover:bg-orange-600 text-[#0b132b] dark:text-white font-black py-3 px-6 rounded-xl shadow-lg transition-all text-center">
                        BOOK NEW SERVICE
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 animate-pulse h-48 flex flex-col justify-between">
                                <div><div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div><div className="h-4 bg-gray-100 rounded w-full mb-2"></div></div>
                            </div>
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <h3 className="text-2xl font-bold text-[#0b132b] dark:text-white mb-2">No active tasks</h3>
                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-sm mb-8">You don't have any pending documents or service requests.</p>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
                            <motion.div key={task._id} whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300">
                                <h2 className="text-xl font-bold text-[#0b132b] dark:text-white mb-4">{task.title}</h2>
                                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mb-6">{task.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getStatusStyles(task.status)}`}>{task.status || "Processing"}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
