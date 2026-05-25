import { useEffect, useState } from "react";
import API from "../services/api";

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchBlogs = async () => {
            try {
                const { data } = await API.get("/blogs");

                if (isMounted) {
                    setBlogs(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchBlogs();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <p className="text-sm uppercase tracking-[0.3em] font-black text-orange-500">Blogs</p>
                    <h1 className="text-3xl md:text-4xl font-black text-[#0b132b] dark:text-white mt-3">Latest blog updates</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Read the newest updates, tips, and announcements from the team.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="animate-pulse rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 h-32" />
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                        No blogs are available right now.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {blogs.map((item) => (
                            <article key={item._id} className="rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                                <div className="flex flex-col gap-4">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full max-h-64 rounded-2xl object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] font-black text-orange-500">Blog</p>
                                        <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">{item.title}</h2>
                                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blogs;
