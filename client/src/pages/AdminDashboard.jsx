import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

const emptyServiceForm = {
    title: "",
    category: "document",
    price: "",
    durationValue: 1,
    durationUnit: "hours",
    maxBookings: 10,
    image: "",
    description: "",
    file: null,
    isFeatured: false,
    requiresDocuments: false,
    requiresTravelDetails: false,
    requiresFormName: false,
    isPerItemPricing: false,
    itemPrice: 0,
    requiresPersonalDetails: true,
    requiresPickupTime: false,
    documentTypes: ""
};

const categories = [
    "Document",
    "Typing",
    "Printing",
    "Scanning",
    "Website",
    "Forms",
    "Other"
];

const statusOptions = ["pending", "in-progress", "done", "successful", "cancelled"];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [services, setServices] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [serviceForm, setServiceForm] = useState(emptyServiceForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const [serviceMessage, setServiceMessage] = useState("");
    const [activeTab, setActiveTab] = useState("services");
    const [updatingBookingId, setUpdatingBookingId] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState({});

    useEffect(() => {
        let isMounted = true;

        const fetchAdminData = async () => {
            try {
                const [statsResponse, servicesResponse, bookingsResponse] = await Promise.all([
                    API.get("/admin/dashboard"),
                    API.get("/services?limit=100"),
                    API.get("/bookings?limit=999")
                ]);

                if (isMounted) {
                    setStats(statsResponse.data.data || statsResponse.data);
                    setServices(servicesResponse.data.data || []);
                    setAllBookings(bookingsResponse.data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch admin data", err);

                if (isMounted) {
                    setError("Could not load admin dashboard data.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAdminData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFormChange = (event) => {
        const { name, value, type, checked } = event.target;
        setServiceForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setServiceForm((current) => ({
            ...current,
            file: file || null
        }));
    };

    const handleCreateService = async (event) => {
        event.preventDefault();
        setIsCreating(true);
        setServiceMessage("");

        try {
            let requestData;
            let config = {};

            const formFieldsObj = {
                requiresDocuments: serviceForm.requiresDocuments,
                requiresTravelDetails: serviceForm.requiresTravelDetails,
                requiresFormName: serviceForm.requiresFormName,
                isPerItemPricing: serviceForm.isPerItemPricing,
                itemPrice: Number(serviceForm.itemPrice) || 0,
                requiresPersonalDetails: serviceForm.requiresPersonalDetails,
                requiresPickupTime: serviceForm.requiresPickupTime,
                documentTypes: serviceForm.documentTypes ? serviceForm.documentTypes.split(',').map(d => d.trim()).filter(Boolean) : []
            };

            // If a file is uploaded, we must send it as FormData
            if (serviceForm.file) {
                requestData = new FormData();
                requestData.append("title", serviceForm.title.trim());
                requestData.append("category", serviceForm.category.toLowerCase());
                requestData.append("price", Number(serviceForm.price));

                // Stringify the duration object so the backend can parse it
                requestData.append("duration", JSON.stringify({
                    value: Number(serviceForm.durationValue) || 1,
                    unit: serviceForm.durationUnit
                }));
                requestData.append("formFields", JSON.stringify(formFieldsObj));

                requestData.append("maxBookings", Number(serviceForm.maxBookings) || 10);
                if (serviceForm.image.trim()) requestData.append("image", serviceForm.image.trim());
                requestData.append("description", serviceForm.description.trim());

                requestData.append("isFeatured", serviceForm.isFeatured);

                // Append the actual file
                requestData.append("document", serviceForm.file);

                // Set headers for file upload
                config.headers = { "Content-Type": "multipart/form-data" };
            } else {
                // If no file is attached, send standard JSON payload
                requestData = {
                    title: serviceForm.title.trim(),
                    category: serviceForm.category.toLowerCase(),
                    price: Number(serviceForm.price),
                    duration: {
                        value: Number(serviceForm.durationValue) || 1,
                        unit: serviceForm.durationUnit
                    },
                    formFields: formFieldsObj,
                    maxBookings: Number(serviceForm.maxBookings) || 10,
                    isFeatured: serviceForm.isFeatured,
                    image: serviceForm.image.trim() || null,
                    description: serviceForm.description.trim()
                };
            }

            const { data } = await API.post("/services", requestData, config);

            setServices((current) => [data.data, ...current]);
            setStats((current) => current
                ? {
                    ...current,
                    totalServices: (current.totalServices || 0) + 1
                }
                : current
            );

            // Reset form
            setServiceForm(emptyServiceForm);
            // Clear the native file input visually
            const fileInput = document.getElementById("document-upload");
            if (fileInput) fileInput.value = "";

            setServiceMessage("Service added successfully.");
        } catch (err) {
            console.error("Failed to create service", err);
            setServiceMessage(err.response?.data?.message || "Could not create service.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        setServiceMessage("");

        try {
            await API.delete(`/services/${serviceId}`);
            setServices((current) => current.filter((service) => service._id !== serviceId));
            setStats((current) => current
                ? {
                    ...current,
                    totalServices: Math.max((current.totalServices || 1) - 1, 0)
                }
                : current
            );
            setServiceMessage("Service removed.");
        } catch (err) {
            console.error("Failed to delete service", err);
            setServiceMessage(err.response?.data?.message || "Could not delete service.");
        }
    };

    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        setUpdatingBookingId(bookingId);
        try {
            await API.put(`/bookings/${bookingId}/status`, { status: newStatus });
            setAllBookings((current) =>
                current.map((booking) =>
                    booking._id === bookingId ? { ...booking, status: newStatus } : booking
                )
            );
            setUpdatingStatus({});
        } catch (err) {
            console.error("Failed to update booking status", err);
            alert("Failed to update booking status");
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase() || "pending";
        if (s === "completed" || s === "approved" || s === "done" || s === "successful") return "bg-green-100 text-green-700";
        if (s === "rejected" || s === "cancelled") return "bg-red-100 text-red-700";
        if (s === "in-progress" || s === "in progress") return "bg-blue-100 text-blue-700";
        return "bg-yellow-100 text-yellow-700";
    };

    // Download a document by fetching the blob and triggering a client-side download.
    const downloadDocument = async (doc) => {
        try {
            const headers = {};
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || null;
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(doc.url, { mode: 'cors', headers });

            if (!res.ok) {
                // If auth required or forbidden, open in a new tab so user can sign-in or see the error page
                if (res.status === 401 || res.status === 403) {
                    window.open(doc.url, '_blank', 'noopener');
                    return;
                }
                throw new Error(`Failed to fetch file: ${res.status}`);
            }

            const contentType = res.headers.get('content-type') || '';
            // If the response is an HTML error page, open it in a new tab instead of trying to download
            if (contentType.includes('text/html')) {
                window.open(doc.url, '_blank', 'noopener');
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Try to derive filename from the response headers if not provided
            let filename = doc.filename;
            const cd = res.headers.get('content-disposition');
            if (!filename && cd) {
                const m = cd.match(/filename\*?=(?:UTF-8''?)?"?([^";]+)/);
                if (m) filename = decodeURIComponent(m[1]);
            }

            a.download = filename || `document`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed', err);
            // Fallback: open the file in a new tab
            window.open(doc.url, '_blank', 'noopener');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 flex items-center justify-center">
                <div className="text-xl font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 animate-pulse">Loading Admin Dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-red-500 mb-4">{error}</div>
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center max-w-md">
                    Please ensure you have admin privileges and the backend server is running properly.
                </p>
            </div>
        );
    }

    // Check if the current category is Printing or Document to show the file section
    const showFileSection = ["printing", "document"].includes(serviceForm.category.toLowerCase());

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#0b132b] dark:text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2 font-medium">Manage users, bookings, and cafe services.</p>
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">Total Users</h2>
                        <p className="text-4xl font-black text-[#0b132b] dark:text-white">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">Total Services</h2>
                        <p className="text-4xl font-black text-[#0b132b] dark:text-white">{stats?.totalServices || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">Total Bookings</h2>
                        <p className="text-4xl font-black text-[#0b132b] dark:text-white">{stats?.totalBookings || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">Pending Bookings</h2>
                        <p className="text-4xl font-black text-orange-500">{stats?.pendingBookings || 0}</p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab("services")}
                        className={`px-6 py-3 font-bold text-lg transition-all ${activeTab === "services"
                            ? "text-[#0b132b] dark:text-white border-b-4 border-orange-500"
                            : "text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300"
                            }`}
                    >
                        Manage Services
                    </button>
                    <button
                        onClick={() => setActiveTab("bookings")}
                        className={`px-6 py-3 font-bold text-lg transition-all ${activeTab === "bookings"
                            ? "text-[#0b132b] dark:text-white border-b-4 border-orange-500"
                            : "text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300"
                            }`}
                    >
                        Manage Bookings ({allBookings.length})
                    </button>
                </div>

                {/* SERVICES TAB */}
                {activeTab === "services" && (
                    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h2 className="text-2xl font-black text-[#0b132b] dark:text-white mb-1">Add Service</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-6">Create a service that users can browse and book.</p>

                            {serviceMessage && (
                                <div className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm font-semibold text-gray-600">
                                    {serviceMessage}
                                </div>
                            )}

                            <form onSubmit={handleCreateService} className="space-y-4">
                                <input
                                    type="text"
                                    name="title"
                                    value={serviceForm.title}
                                    onChange={handleFormChange}
                                    placeholder="Service title"
                                    required
                                    minLength={3}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <select
                                        name="category"
                                        value={serviceForm.category}
                                        onChange={handleFormChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
                                    >
                                        {categories.map((category) => (
                                            <option key={category} value={category.toLowerCase()}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        name="price"
                                        value={serviceForm.price}
                                        onChange={handleFormChange}
                                        placeholder="Price"
                                        required
                                        min="0"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
                                    />
                                </div>

                                {showFileSection && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2"
                                    >
                                        <label className="text-sm font-bold text-[#0b132b] dark:text-white block">
                                            Upload Document/Template <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            id="document-upload"
                                            type="file"
                                            name="document"
                                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                            onChange={handleFileChange}
                                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/40"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">Supported formats: PDF, Word, PNG, JPG</p>
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input
                                        type="number"
                                        name="durationValue"
                                        value={serviceForm.durationValue}
                                        onChange={handleFormChange}
                                        min="1"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
                                    />

                                    <select
                                        name="durationUnit"
                                        value={serviceForm.durationUnit}
                                        onChange={handleFormChange}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
                                    >
                                        <option value="hours">hours</option>
                                        <option value="days">days</option>
                                    </select>

                                    <input
                                        type="number"
                                        name="maxBookings"
                                        value={serviceForm.maxBookings}
                                        onChange={handleFormChange}
                                        min="1"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
                                        placeholder="Max Bookings"
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">Service Requirements (Form Fields for User)</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            <input type="checkbox" name="requiresDocuments" checked={serviceForm.requiresDocuments} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            Requires Document Uploads
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            <input type="checkbox" name="requiresTravelDetails" checked={serviceForm.requiresTravelDetails} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            Requires Travel Details (From/To)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            <input type="checkbox" name="requiresFormName" checked={serviceForm.requiresFormName} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            Requires Form Name
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            <input type="checkbox" name="requiresPickupTime" checked={serviceForm.requiresPickupTime} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            Requires Pickup Time
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            <input type="checkbox" name="requiresPersonalDetails" checked={serviceForm.requiresPersonalDetails} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            Requires Personal Details (Name, Phone, Email)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            <input type="checkbox" name="isPerItemPricing" checked={serviceForm.isPerItemPricing} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                            Per Item Pricing (e.g., per page)
                                        </label>
                                    </div>

                                    {serviceForm.isPerItemPricing && (
                                        <input
                                            type="number"
                                            name="itemPrice"
                                            value={serviceForm.itemPrice}
                                            onChange={handleFormChange}
                                            placeholder="Price per item (Rs.)"
                                            min="0"
                                            className="w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                                        />
                                    )}

                                    {serviceForm.requiresDocuments && (
                                        <input
                                            type="text"
                                            name="documentTypes"
                                            value={serviceForm.documentTypes}
                                            onChange={handleFormChange}
                                            placeholder="Required Document Types (comma separated, e.g., Aadhar, Photo, Sign)"
                                            className="w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 px-1">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={serviceForm.isFeatured}
                                            onChange={handleFormChange}
                                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                        Show on Home Page (Featured)
                                    </label>
                                </div>

                                <input
                                    type="url"
                                    name="image"
                                    value={serviceForm.image}
                                    onChange={handleFormChange}
                                    placeholder="Image URL (Thumbnail)"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
                                />

                                <textarea
                                    name="description"
                                    value={serviceForm.description}
                                    onChange={handleFormChange}
                                    placeholder="Service description"
                                    required
                                    minLength={10}
                                    rows={4}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none focus:bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40 resize-none"
                                />

                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full bg-[#0b132b] hover:bg-gray-800 disabled:opacity-60 text-white font-black py-3.5 px-6 rounded-xl shadow-lg transition-colors"
                                >
                                    {isCreating ? "Adding..." : "Add Service"}
                                </button>
                            </form>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black text-[#0b132b] dark:text-white">Service List</h2>
                                <span className="text-sm font-bold text-gray-400 dark:text-gray-500">{services.length} active</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {services.map((service) => (
                                    <motion.div
                                        key={service._id}
                                        whileHover={{ y: -3 }}
                                        className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase font-black tracking-wider text-orange-500 mb-2">
                                                    {service.category}
                                                </p>
                                                <h3 className="text-xl font-black text-[#0b132b] dark:text-white">{service.title}</h3>
                                            </div>
                                            <p className="font-black text-[#0b132b] dark:text-white whitespace-nowrap">Rs. {service.price}</p>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-3 line-clamp-3">{service.description}</p>

                                        {service.documentUrl && (
                                            <a href={service.documentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 underline mt-3 inline-block">
                                                View Attached Document
                                            </a>
                                        )}

                                        <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                                                {service.duration?.value || 1} {service.duration?.unit || "hours"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteService(service._id)}
                                                className="text-sm font-black text-red-500 hover:text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === "bookings" && (
                    <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-black text-[#0b132b] dark:text-white">All Bookings</h2>
                            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-2 font-medium">Manage user bookings and update status</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-black text-gray-700 dark:text-gray-300 text-sm">Service</th>
                                        <th className="px-6 py-4 text-left font-black text-gray-700 dark:text-gray-300 text-sm">User</th>
                                        <th className="px-6 py-4 text-left font-black text-gray-700 dark:text-gray-300 text-sm">Amount</th>
                                        <th className="px-6 py-4 text-left font-black text-gray-700 dark:text-gray-300 text-sm">Status</th>
                                        <th className="px-6 py-4 text-left font-black text-gray-700 dark:text-gray-300 text-sm">Date</th>
                                        <th className="px-6 py-4 text-left font-black text-gray-700 dark:text-gray-300 text-sm">Documents</th>
                                        <th className="px-6 py-4 text-left font-black text-gray-700 dark:text-gray-300 text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {allBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 font-bold">
                                                No bookings found
                                            </td>
                                        </tr>
                                    ) : (
                                        allBookings.map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-black text-[#0b132b] dark:text-white">{booking.service?.title || "Unknown"}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{booking.service?.category || ""}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-[#0b132b] dark:text-white">{booking.personalDetails?.name || booking.user?.name || "N/A"}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{booking.personalDetails?.phone || booking.user?.email || "N/A"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-[#0b132b] dark:text-white">Rs. {booking.amount}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">{formatDate(booking.bookingDate || booking.createdAt)}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {booking.documents && booking.documents.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {booking.documents.map((doc, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    href={doc.url}
                                                                    onClick={(e) => { e.preventDefault(); downloadDocument(doc); }}
                                                                    rel="noopener noreferrer"
                                                                    download={doc.filename || `Document-${idx + 1}`}
                                                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
                                                                >
                                                                    {doc.filename || `Document ${idx + 1}`}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={updatingStatus[booking._id] || booking.status}
                                                        onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                                        disabled={updatingBookingId === booking._id}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-[#0b132b] dark:text-white cursor-pointer hover:bg-gray-50 dark:bg-gray-900 transition-colors disabled:opacity-50"
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {stats?.recentBookings?.length > 0 && activeTab === "services" && (
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-2xl font-black text-[#0b132b] dark:text-white mb-5">Recent Bookings</h2>
                        <div className="space-y-3">
                            {stats.recentBookings.map((booking) => (
                                <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0">
                                    <div>
                                        <p className="font-black text-[#0b132b] dark:text-white">{booking.service?.title || "Unknown service"}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{booking.user?.name || "Unknown user"} - {booking.user?.email || "No email"}</p>
                                    </div>
                                    <span className={`text-xs uppercase font-black tracking-wider px-3 py-1 rounded-full ${getStatusBadge(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;