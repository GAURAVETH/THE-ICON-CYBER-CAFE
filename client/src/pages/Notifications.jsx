import { useEffect, useState } from "react";
import API from "../services/api";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            try {
                const { data } = await API.get("/job-notifications");

                if (isMounted) {
                    setNotifications(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchNotifications();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <p className="text-sm uppercase tracking-[0.3em] font-black text-orange-500">Notifications</p>
                    <h1 className="text-3xl md:text-4xl font-black text-[#0b132b] dark:text-white mt-3">Latest job notifications</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Stay updated with new opportunities and requirements from the admin team.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="animate-pulse rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 h-28" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                        No job notifications are available right now.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((item) => (
                            <div key={item._id} className="rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] font-black text-orange-500">New Job</p>
                                        <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">{item.title}</h2>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black">New Job Notification</span>
                                </div>
                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                                {item.requiredDocuments && (
                                    <p className="mt-4 text-sm font-bold text-gray-600 dark:text-gray-300">Required documents: {item.requiredDocuments}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
