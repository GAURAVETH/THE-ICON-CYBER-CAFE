import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

const BookingService = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchBookings = async () => {
            try {
                const bookingsRes = await API.get("/bookings");

                if (isMounted) {
                    setBookings(bookingsRes.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
                if (isMounted) {
                    setMessage("Failed to load booking history");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchBookings();

        return () => {
            isMounted = false;
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase() || "pending";
        if (s === "completed" || s === "approved") return "bg-green-100 text-green-700";
        if (s === "rejected" || s === "cancelled") return "bg-red-100 text-red-700";
        if (s === "in-progress" || s === "in progress") return "bg-blue-100 text-blue-700";
        if (s === "done") return "bg-green-100 text-green-700";
        if (s === "successful") return "bg-green-100 text-green-700";
        return "bg-yellow-100 text-yellow-700"; // Pending
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
                <div className="text-xl font-bold text-gray-500 dark:text-gray-400 animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-[#0b132b] dark:text-white tracking-tight">Booking History</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and track your past and current bookings.</p>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl text-center font-bold ${message.includes("success")
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                    >
                        {message}
                    </motion.div>
                )}

                <div>
                    {bookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center"
                        >
                            <p className="text-gray-500 dark:text-gray-400 font-bold">No bookings yet</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <motion.div
                                    key={booking._id}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-black text-[#0b132b] dark:text-white">{booking.service?.title || "Service"}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Booked on: {formatDate(booking.bookingDate || booking.createdAt)}</p>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusBadge(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Amount</p>
                                            <p className="text-lg font-black text-[#0b132b] dark:text-white">Rs. {booking.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Payment</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{booking.paymentStatus || "Pending"}</p>
                                        </div>
                                        {booking.personalDetails?.name && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Name</p>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{booking.personalDetails.name}</p>
                                            </div>
                                        )}
                                        {booking.personalDetails?.phone && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Phone</p>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{booking.personalDetails.phone}</p>
                                            </div>
                                        )}
                                    </div>

                                    {booking.formName && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Form: <span className="font-bold text-gray-900 dark:text-white">{booking.formName}</span></p>
                                    )}

                                    {booking.travelDetails?.from && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Travel: <span className="font-bold text-gray-900 dark:text-white">{booking.travelDetails.from} → {booking.travelDetails.to}</span></p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingService;
