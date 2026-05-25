import { useEffect, useRef, useState } from "react";
import API from "../services/api";

const emptyServiceForm = {
    title: "",
    description: "",
    price: "",
    category: "Computer Repair",
    durationValue: "1",
    durationUnit: "hours",
    requiredDocuments: "",
    documents: []
};

const emptyBlogForm = {
    title: "",
    description: "",
    image: ""
};

const emptyJobForm = {
    title: "",
    description: "",
    requiredDocuments: "",
    image: ""
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalServices: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0
    });
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serviceForm, setServiceForm] = useState(emptyServiceForm);
    const [blogForm, setBlogForm] = useState(emptyBlogForm);
    const [jobForm, setJobForm] = useState(emptyJobForm);
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editingBlogId, setEditingBlogId] = useState(null);
    const [editingJobId, setEditingJobId] = useState(null);
    const serviceInputRef = useRef(null);
    const blogInputRef = useRef(null);
    const jobInputRef = useRef(null);

    const loadAdminData = async () => {
        try {
            const [dashboardResponse, servicesResponse, bookingsResponse, blogsResponse, jobsResponse] = await Promise.all([
                API.get("/admin/dashboard"),
                API.get("/services?limit=100"),
                API.get("/bookings?limit=100"),
                API.get("/blogs"),
                API.get("/job-notifications")
            ]);

            const summary = dashboardResponse.data.data || {};
            setStats({
                totalUsers: summary.totalUsers || 0,
                totalServices: summary.totalServices || servicesResponse.data.data?.length || 0,
                totalBookings: summary.totalBookings || 0,
                pendingBookings: summary.pendingBookings || 0,
                totalRevenue: summary.totalRevenue || 0
            });
            setServices(servicesResponse.data.data || []);
            setBookings(bookingsResponse.data.data || []);
            setBlogs(blogsResponse.data.data || []);
            setJobs(jobsResponse.data.data || []);
        } catch (error) {
            console.error("Failed to load admin dashboard", error);
            setMessage("Unable to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    const uploadDocuments = async (files) => {
        if (!files || files.length === 0) {
            return [];
        }

        const payload = new FormData();
        files.forEach((file) => payload.append("files", file));

        const { data } = await API.post("/upload", payload, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return data.files.map((file) => ({
            filename: file.filename,
            url: file.url,
            documentType: file.mimetype,
            uploadedAt: new Date().toISOString()
        }));
    };

    const resetServiceForm = () => {
        setServiceForm(emptyServiceForm);
        setEditingServiceId(null);

        if (serviceInputRef.current) {
            serviceInputRef.current.value = "";
        }
    };

    const resetBlogForm = () => {
        setBlogForm(emptyBlogForm);
        setEditingBlogId(null);

        if (blogInputRef.current) {
            blogInputRef.current.value = "";
        }
    };

    const resetJobForm = () => {
        setJobForm(emptyJobForm);
        setEditingJobId(null);

        if (jobInputRef.current) {
            jobInputRef.current.value = "";
        }
    };

    const handleServiceFileChange = (event) => {
        setServiceForm((current) => ({
            ...current,
            documents: Array.from(event.target.files || [])
        }));
    };

    const handleBlogFileChange = (event) => {
        setBlogForm((current) => ({
            ...current,
            image: event.target.files?.[0] || ""
        }));
    };

    const handleJobFileChange = (event) => {
        setJobForm((current) => ({
            ...current,
            image: event.target.files?.[0] || ""
        }));
    };

    const handleCreateService = async (event) => {
        event.preventDefault();

        if (!serviceForm.title || !serviceForm.description || !serviceForm.price || !serviceForm.category) {
            setMessage("Please fill in all required service fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage("");

            const currentService = editingServiceId ? services.find((service) => service._id === editingServiceId) : null;
            const documents = serviceForm.documents.length > 0
                ? await uploadDocuments(serviceForm.documents)
                : currentService?.documents || [];

            if (editingServiceId) {
                const { data } = await API.put(`/services/${editingServiceId}`, {
                    title: serviceForm.title,
                    description: serviceForm.description,
                    price: Number(serviceForm.price),
                    category: serviceForm.category,
                    duration: {
                        value: Number(serviceForm.durationValue || 1),
                        unit: serviceForm.durationUnit
                    },
                    requiredDocuments: serviceForm.requiredDocuments,
                    formFields: {
                        requiresDocuments: Boolean(serviceForm.requiredDocuments)
                    },
                    availability: currentService?.availability ?? true,
                    isFeatured: currentService?.isFeatured ?? true,
                    documents
                });

                setServices((current) => current.map((service) => service._id === editingServiceId ? data.data : service));
                setMessage("Service updated successfully.");
            } else {
                const { data } = await API.post("/services", {
                    title: serviceForm.title,
                    description: serviceForm.description,
                    price: Number(serviceForm.price),
                    category: serviceForm.category,
                    duration: {
                        value: Number(serviceForm.durationValue || 1),
                        unit: serviceForm.durationUnit
                    },
                    requiredDocuments: serviceForm.requiredDocuments,
                    formFields: {
                        requiresDocuments: Boolean(serviceForm.requiredDocuments)
                    },
                    availability: true,
                    isFeatured: true,
                    documents
                });

                setServices((current) => [data.data, ...current]);
                setMessage("Service created successfully.");
            }

            resetServiceForm();
        } catch (error) {
            console.error("Failed to save service", error);
            setMessage(error.response?.data?.message || "Could not save service right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateBlog = async (event) => {
        event.preventDefault();

        if (!blogForm.title || !blogForm.description) {
            setMessage("Please provide a title and description for the blog.");
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage("");

            const currentBlog = editingBlogId ? blogs.find((blog) => blog._id === editingBlogId) : null;
            let imageUrl = blogForm.image;

            if (blogForm.image && typeof blogForm.image !== "string") {
                const uploaded = await uploadDocuments([blogForm.image]);
                imageUrl = uploaded[0]?.url || "";
            } else if (!blogForm.image && currentBlog) {
                imageUrl = currentBlog.image || "";
            }

            if (editingBlogId) {
                const { data } = await API.put(`/blogs/${editingBlogId}`, {
                    title: blogForm.title,
                    description: blogForm.description,
                    image: imageUrl,
                    isPublished: currentBlog?.isPublished ?? true
                });

                setBlogs((current) => current.map((blog) => blog._id === editingBlogId ? data.data : blog));
                setMessage("Blog updated successfully.");
            } else {
                const { data } = await API.post("/blogs", {
                    title: blogForm.title,
                    description: blogForm.description,
                    image: imageUrl,
                    isPublished: true
                });

                setBlogs((current) => [data.data, ...current]);
                setMessage("Blog published successfully.");
            }

            resetBlogForm();
        } catch (error) {
            console.error("Failed to save blog", error);
            setMessage(error.response?.data?.message || "Could not save blog right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateJob = async (event) => {
        event.preventDefault();

        if (!jobForm.title || !jobForm.description) {
            setMessage("Please provide a title and description for the job notification.");
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage("");

            const currentJob = editingJobId ? jobs.find((job) => job._id === editingJobId) : null;
            let imageUrl = jobForm.image;

            if (jobForm.image && typeof jobForm.image !== "string") {
                const uploaded = await uploadDocuments([jobForm.image]);
                imageUrl = uploaded[0]?.url || "";
            } else if (!jobForm.image && currentJob) {
                imageUrl = currentJob.image || "";
            }

            if (editingJobId) {
                const { data } = await API.put(`/job-notifications/${editingJobId}`, {
                    title: jobForm.title,
                    description: jobForm.description,
                    requiredDocuments: jobForm.requiredDocuments,
                    image: imageUrl,
                    isActive: currentJob?.isActive ?? true
                });

                setJobs((current) => current.map((job) => job._id === editingJobId ? data.data : job));
                setMessage("Job notification updated successfully.");
            } else {
                const { data } = await API.post("/job-notifications", {
                    title: jobForm.title,
                    description: jobForm.description,
                    requiredDocuments: jobForm.requiredDocuments,
                    image: imageUrl,
                    isActive: true
                });

                setJobs((current) => [data.data, ...current]);
                setMessage("Job notification created successfully.");
            }

            resetJobForm();
        } catch (error) {
            console.error("Failed to save job notification", error);
            setMessage(error.response?.data?.message || "Could not save job notification right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBookingStatusUpdate = async (bookingId, status) => {
        try {
            const { data } = await API.put(`/bookings/${bookingId}/status`, { status });
            setBookings((current) => current.map((booking) => booking._id === bookingId ? data.data : booking));
            setMessage(`Booking status updated to ${status}.`);
        } catch (error) {
            console.error("Failed to update booking status", error);
            setMessage(error.response?.data?.message || "Could not update booking status.");
        }
    };

    const handleToggleService = async (serviceId, isActive) => {
        try {
            const { data } = await API.put(`/services/${serviceId}`, { isActive: !isActive });
            setServices((current) => current.map((service) => service._id === serviceId ? data.data : service));
            setMessage("Service availability updated.");
        } catch (error) {
            console.error("Failed to toggle service", error);
            setMessage(error.response?.data?.message || "Could not update service right now.");
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            await API.delete(`/services/${serviceId}`);
            setServices((current) => current.filter((service) => service._id !== serviceId));
            setMessage("Service deleted successfully.");
        } catch (error) {
            console.error("Failed to delete service", error);
            setMessage(error.response?.data?.message || "Could not delete service right now.");
        }
    };

    const handleEditService = (service) => {
        setEditingServiceId(service._id);
        setServiceForm({
            title: service.title || "",
            description: service.description || "",
            price: String(service.price || ""),
            category: service.category || "Computer Repair",
            durationValue: String(service.duration?.value || 1),
            durationUnit: service.duration?.unit || "hours",
            requiredDocuments: service.requiredDocuments || "",
            documents: []
        });
    };

    const handleDeleteBlog = async (blogId) => {
        try {
            await API.delete(`/blogs/${blogId}`);
            setBlogs((current) => current.filter((blog) => blog._id !== blogId));
            setMessage("Blog deleted successfully.");
        } catch (error) {
            console.error("Failed to delete blog", error);
            setMessage(error.response?.data?.message || "Could not delete blog right now.");
        }
    };

    const handleEditBlog = (blog) => {
        setEditingBlogId(blog._id);
        setBlogForm({
            title: blog.title || "",
            description: blog.description || "",
            image: blog.image || ""
        });
    };

    const handleDeleteJob = async (jobId) => {
        try {
            await API.delete(`/job-notifications/${jobId}`);
            setJobs((current) => current.filter((job) => job._id !== jobId));
            setMessage("Job notification deleted successfully.");
        } catch (error) {
            console.error("Failed to delete job notification", error);
            setMessage(error.response?.data?.message || "Could not delete job notification right now.");
        }
    };

    const handleEditJob = (job) => {
        setEditingJobId(job._id);
        setJobForm({
            title: job.title || "",
            description: job.description || "",
            requiredDocuments: job.requiredDocuments || "",
            image: job.image || ""
        });
    };

    const downloadDocument = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filename || "document";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Failed to download document", error);
            setMessage("Could not download the selected document.");
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            "awaiting-payment": "bg-yellow-100 text-yellow-700 border-yellow-200",
            pending: "bg-orange-100 text-orange-700 border-orange-200",
            confirmed: "bg-blue-100 text-blue-700 border-blue-200",
            "in-progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
            completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
            cancelled: "bg-rose-100 text-rose-700 border-rose-200"
        };

        return classes[status] || "bg-slate-100 text-slate-700 border-slate-200";
    };

    const formatDate = (value) => {
        if (!value) {
            return "N/A";
        }

        return new Date(value).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 px-4 py-10 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse rounded-[2rem] bg-white dark:bg-gray-800 h-28 border border-gray-100 dark:border-gray-700" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] font-black text-orange-500">Admin Dashboard</p>
                        <h1 className="text-3xl md:text-4xl font-black text-[#0b132b] dark:text-white mt-3">Operations center</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-2xl">Manage services, monitor booking requests, and publish blogs or job notifications from one control panel.</p>
                    </div>
                </div>

                {message && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 dark:bg-orange-900/20 px-4 py-3 text-sm font-bold text-orange-700 dark:text-orange-200">
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5">
                        <p className="text-sm uppercase tracking-[0.2em] font-black text-gray-400">Users</p>
                        <p className="mt-3 text-3xl font-black text-[#0b132b] dark:text-white">{stats.totalUsers}</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5">
                        <p className="text-sm uppercase tracking-[0.2em] font-black text-gray-400">Services</p>
                        <p className="mt-3 text-3xl font-black text-[#0b132b] dark:text-white">{stats.totalServices}</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5">
                        <p className="text-sm uppercase tracking-[0.2em] font-black text-gray-400">Bookings</p>
                        <p className="mt-3 text-3xl font-black text-[#0b132b] dark:text-white">{stats.totalBookings}</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5">
                        <p className="text-sm uppercase tracking-[0.2em] font-black text-gray-400">Pending</p>
                        <p className="mt-3 text-3xl font-black text-[#0b132b] dark:text-white">{stats.pendingBookings}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">Manage services</p>
                                <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">Create new offerings</h2>
                            </div>
                        </div>

                        <form onSubmit={handleCreateService} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Service title
                                    <input value={serviceForm.title} onChange={(event) => setServiceForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                                </label>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Category
                                    <select value={serviceForm.category} onChange={(event) => setServiceForm((current) => ({ ...current, category: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2">
                                        <option>Computer Repair</option>
                                        <option>Network & Internet</option>
                                        <option>Cyber Cafe Setup</option>
                                        <option>Software Installation</option>
                                    </select>
                                </label>
                            </div>

                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Description
                                <textarea value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Price
                                    <input type="number" min="0" value={serviceForm.price} onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                                </label>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Duration
                                    <input type="number" min="1" value={serviceForm.durationValue} onChange={(event) => setServiceForm((current) => ({ ...current, durationValue: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                                </label>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Unit
                                    <select value={serviceForm.durationUnit} onChange={(event) => setServiceForm((current) => ({ ...current, durationUnit: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2">
                                        <option>hours</option>
                                        <option>days</option>
                                        <option>minutes</option>
                                    </select>
                                </label>
                            </div>

                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Required documents
                                <input value={serviceForm.requiredDocuments} onChange={(event) => setServiceForm((current) => ({ ...current, requiredDocuments: event.target.value }))} placeholder="e.g. Aadhaar Card, Invoice" className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                            </label>

                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Upload service documents
                                <input ref={serviceInputRef} type="file" multiple onChange={handleServiceFileChange} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="mt-1 w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-3" />
                            </label>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#0b132b] hover:bg-gray-800 text-white font-black py-3 rounded-xl disabled:opacity-60">
                                {isSubmitting ? "Saving..." : editingServiceId ? "Update Service" : "Create Service"}
                            </button>
                            {editingServiceId && (
                                <button type="button" onClick={resetServiceForm} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-black text-gray-700 dark:text-gray-200">
                                    Cancel edit
                                </button>
                            )}
                        </form>

                        <div className="mt-6 max-h-[360px] overflow-y-auto space-y-3 pr-1">
                            {services.map((service) => (
                                <div key={service._id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-black text-[#0b132b] dark:text-white">{service.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{service.description}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Rs. {service.price} • {service.duration?.value || 1} {service.duration?.unit || "hours"}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${service.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                                {service.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                <button type="button" onClick={() => handleEditService(service)} className="px-3 py-1 rounded-lg bg-sky-100 text-sky-700 text-xs font-black">Edit</button>
                                                <button type="button" onClick={() => handleToggleService(service._id, service.isActive)} className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-black">Toggle</button>
                                                <button type="button" onClick={() => handleDeleteService(service._id)} className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-black">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                    {service.documents?.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-black uppercase text-gray-400">Attached docs</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {service.documents.map((document, index) => (
                                                    <button key={`${document.url}-${index}`} type="button" onClick={() => downloadDocument(document.url, document.filename)} className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-xs font-bold border border-gray-200 dark:border-gray-700">
                                                        {document.filename}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">Booking queue</p>
                                <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">Customer requests</h2>
                            </div>
                        </div>

                        <div className="max-h-[720px] overflow-y-auto space-y-3 pr-1">
                            {bookings.map((booking) => (
                                <div key={booking._id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-black text-[#0b132b] dark:text-white">{booking.service?.title || "Service"}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Customer: {booking.personalDetails?.name || booking.user?.name || "Unknown"}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-300">{formatDate(booking.createdAt)}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full border text-xs font-black ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {['awaiting-payment', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                                            <button key={status} type="button" onClick={() => handleBookingStatusUpdate(booking._id, status)} className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold">
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    {booking.documents?.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-black uppercase text-gray-400">Submitted docs</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {booking.documents.map((document, index) => (
                                                    <button key={`${document.url}-${index}`} type="button" onClick={() => downloadDocument(document.url, document.filename)} className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-xs font-bold border border-gray-200 dark:border-gray-700">
                                                        {document.filename}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">Publish blog</p>
                                <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">Create a blog post</h2>
                            </div>
                        </div>
                        <form onSubmit={handleCreateBlog} className="space-y-3">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Title
                                <input value={blogForm.title} onChange={(event) => setBlogForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                            </label>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Description
                                <textarea value={blogForm.description} onChange={(event) => setBlogForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                            </label>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Cover image
                                <input ref={blogInputRef} type="file" onChange={handleBlogFileChange} className="mt-1 w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-3" />
                            </label>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#0b132b] hover:bg-gray-800 text-white font-black py-3 rounded-xl disabled:opacity-60">
                                {isSubmitting ? "Saving..." : editingBlogId ? "Update Blog" : "Publish Blog"}
                            </button>
                            {editingBlogId && (
                                <button type="button" onClick={resetBlogForm} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-black text-gray-700 dark:text-gray-200">
                                    Cancel edit
                                </button>
                            )}
                        </form>

                        <div className="mt-6 max-h-[260px] overflow-y-auto space-y-3 pr-1">
                            {blogs.map((blog) => (
                                <div key={blog._id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-black text-[#0b132b] dark:text-white">{blog.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{blog.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => handleEditBlog(blog)} className="px-3 py-1 rounded-lg bg-sky-100 text-sky-700 text-xs font-black">Edit</button>
                                            <button type="button" onClick={() => handleDeleteBlog(blog._id)} className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-black">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-400 dark:text-gray-500">Publish job notification</p>
                                <h2 className="text-xl font-black text-[#0b132b] dark:text-white mt-2">Share new openings</h2>
                            </div>
                        </div>
                        <form onSubmit={handleCreateJob} className="space-y-3">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Title
                                <input value={jobForm.title} onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                            </label>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Description
                                <textarea value={jobForm.description} onChange={(event) => setJobForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                            </label>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Required documents
                                <input value={jobForm.requiredDocuments} onChange={(event) => setJobForm((current) => ({ ...current, requiredDocuments: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2" />
                            </label>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Cover image
                                <input ref={jobInputRef} type="file" onChange={handleJobFileChange} className="mt-1 w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-3" />
                            </label>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#0b132b] hover:bg-gray-800 text-white font-black py-3 rounded-xl disabled:opacity-60">
                                {isSubmitting ? "Saving..." : editingJobId ? "Update Job Notification" : "Create Job Notification"}
                            </button>
                            {editingJobId && (
                                <button type="button" onClick={resetJobForm} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-black text-gray-700 dark:text-gray-200">
                                    Cancel edit
                                </button>
                            )}
                        </form>

                        <div className="mt-6 max-h-[260px] overflow-y-auto space-y-3 pr-1">
                            {jobs.map((job) => (
                                <div key={job._id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-black text-[#0b132b] dark:text-white">{job.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{job.description}</p>
                                            {job.requiredDocuments && (
                                                <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Required docs: {job.requiredDocuments}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => handleEditJob(job)} className="px-3 py-1 rounded-lg bg-sky-100 text-sky-700 text-xs font-black">Edit</button>
                                            <button type="button" onClick={() => handleDeleteJob(job._id)} className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-black">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;