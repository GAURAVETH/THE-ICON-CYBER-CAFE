import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { motion } from "framer-motion";

const Profile = () => {
    const { user, login } = useAuth(); // use login to update context user data
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const { data } = await API.put("/auth/profile", formData);
            // Update auth context with new user data.
            // Since our login context function usually takes (userData, token), 
            // and we only have userData here, we can just fetch the profile again or 
            // rely on the user object being returned.
            // A quick hack is to store token and re-login, but `AuthContext` might need a direct `setUser` function.
            // For now, reload the page to get the fresh data from `/api/auth/me` on mount.
            
            setMessage("Profile updated successfully!");
            setIsEditing(false);
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-[#0b132b] dark:text-white tracking-tight">My Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your account details and settings.</p>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl text-center font-bold ${
                            message.includes("success") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                    >
                        {message}
                    </motion.div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="bg-[#0b132b] dark:bg-gray-950 h-32 relative"></div>
                    
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-center -mt-16 mb-6">
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=f97316&color=fff&size=128`}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg bg-white"
                            />
                        </div>

                        {!isEditing ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-[#0b132b] dark:text-white">{user?.name}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">{user?.role.toUpperCase()}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{user?.phone || "Not provided"}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 md:col-span-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{user?.address || "Not provided"}</p>
                                    </div>
                                </div>

                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-orange-500 hover:bg-orange-600 text-[#0b132b] font-black py-3 px-8 rounded-xl shadow-md transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40 resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-[#0b132b] dark:bg-orange-500 hover:bg-gray-800 dark:hover:bg-orange-600 text-white dark:text-[#0b132b] font-black py-3 rounded-xl shadow-md transition-colors"
                                    >
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;