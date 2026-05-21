import {
    useEffect,
    useMemo,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const categories = [
    "all",
    "document",
    "typing",
    "printing",
    "scanning",
    "website",
    "forms",
    "other"
];

const Services = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedService, setSelectedService] = useState(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        bookingDate: "",
        quantity: 1,
        formName: "",
        travelFrom: "",
        travelTo: "",
        name: "",
        phone: "",
        pickupTime: "",
        useEMI: false,
        emiMonths: 0,
        documents: [],
        personalDetails: {}
    });

    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            try {
                const { data } = await API.get("/services?limit=100");

                if (isMounted) {
                    setServices(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch services", err);

                if (isMounted) {
                    setError("Could not load services. Please check the backend server.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchServices();

        return () => {
            isMounted = false;
        };
    }, []);

    const visibleServices = useMemo(() => {
        const query = search.trim().toLowerCase();

        return services.filter((service) => {
            const matchesCategory = category === "all" || service.category === category;
            const matchesSearch = !query
                || service.title?.toLowerCase().includes(query)
                || service.description?.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [category, search, services]);

    const openBookingForm = (service) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role === "admin") {
            navigate("/admin");
            return;
        }

        setSelectedService(service);
        setMessage("");
    };

    const handleSpeak = (text, e) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported in this browser.');
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, ...files]
        }));
    };

    const calculateAmount = (service, qty) => {
        if (service?.formFields?.isPerItemPricing) {
            return (service.formFields.itemPrice * qty).toFixed(2);
        }
        return (service.price * qty).toFixed(2);
    };

    const uploadDocumentsToCloudinary = async () => {

        const formDataPayload = new FormData();

        formData.documents.forEach((doc) => {
            formDataPayload.append("files", doc);
        });

        const response = await API.post(
            "/upload",
            formDataPayload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data.files.map((file) => ({
            filename: file.filename,
            url: file.url,
            documentType: file.mimetype,
            uploadedAt: new Date().toISOString(),
        }));
    };

    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        if (!selectedService) {
            setMessage("Please select a service");
            return;
        }

        if (selectedService.formFields?.requiresDocuments && formData.documents.length === 0) {
            setMessage("Please upload the required documents before booking.");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            let documents = [];

            if (formData.documents.length > 0) {
                documents = await uploadDocumentsToCloudinary();
            }

            const bookingPayload = {
                serviceId: selectedService._id,
                bookingDate: formData.bookingDate,
                quantity: parseInt(formData.quantity),
                formName: selectedService.formFields?.requiresFormName ? formData.formName : undefined,
                travelDetails: selectedService.formFields?.requiresTravelDetails ? {
                    from: formData.travelFrom,
                    to: formData.travelTo
                } : undefined,
                personalDetails: selectedService.formFields?.requiresPersonalDetails ? {
                    name: formData.name,
                    phone: formData.phone
                } : undefined,
                pickupTime: selectedService.formFields?.requiresPickupTime ? formData.pickupTime : undefined,
                useEMI: formData.useEMI,
                emiMonths: formData.useEMI ? parseInt(formData.emiMonths) : undefined,
                documents
            };

            await API.post("/bookings", bookingPayload);
            setMessage("Booking created successfully! Check your bookings history.");
            setSelectedService(null);
            setFormData({
                bookingDate: "",
                quantity: 1,
                formName: "",
                travelFrom: "",
                travelTo: "",
                name: "",
                phone: "",
                pickupTime: "",
                useEMI: false,
                emiMonths: 0,
                documents: [],
                personalDetails: {}
            });
            navigate("/bookings"); // Redirect to booking history

        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to create booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#0b132b] dark:text-white tracking-tight">Services</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            Browse cafe services and book a slot online.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search services"
                            className="w-full sm:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40"
                        />

                        <select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40"
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item === "all" ? "All categories" : item}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 h-96 animate-pulse" />
                        ))}
                    </div>
                ) : visibleServices.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-12 text-center">
                        <h2 className="text-2xl font-black text-[#0b132b] dark:text-white">No services found</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Try another search or category.</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${selectedService ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {/* Services List */}
                        <div className={`${selectedService ? 'lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4' : 'col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
                            {visibleServices.map((service) => (
                                <div
                                    key={service._id}
                                    className={`bg-white dark:bg-gray-800 rounded-3xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow ${selectedService?._id === service._id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700'}`}
                                >
                                    {service.image ? (
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="h-fit w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-48 w-full bg-[#0b132b] dark:bg-gray-950 flex items-center justify-center">
                                            <span className="text-white text-4xl font-black">
                                                {service.title?.slice(0, 1) || "S"}
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase font-black tracking-wider text-orange-500 mb-2">
                                                    {service.category}
                                                </p>
                                                <h2 className="text-2xl font-black text-[#0b132b] dark:text-white">
                                                    {service.title}
                                                </h2>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="text-xl font-black text-[#0b132b] dark:text-white whitespace-nowrap">
                                                    Rs. {service.formFields?.isPerItemPricing ? service.formFields.itemPrice : service.price}
                                                </h3>
                                                {service.formFields?.isPerItemPricing && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">per page/item</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between mt-4 gap-2 flex-1">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                                {service.description}
                                            </p>
                                            <button
                                                onClick={(e) => handleSpeak(service.description, e)}
                                                className="shrink-0 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-2 rounded-full transition-colors"
                                                title="Speak Description"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <span>{service.duration?.value || 1} {service.duration?.unit || "hours"}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => openBookingForm(service)}
                                            className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-[#0b132b] font-black py-3 px-6 rounded-xl shadow-lg transition-colors text-center"
                                        >
                                            {selectedService?._id === service._id ? "Selected" : "Book Now"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Booking Form (Right Side) */}
                        {selectedService && (
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 sticky top-20"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-black text-[#0b132b] dark:text-white">Book: {selectedService.title}</h3>
                                        <button
                                            onClick={(e) => handleSpeak(selectedService.description, e)}
                                            className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 p-2 rounded-full transition-colors"
                                            title="Speak Description"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmitBooking} className="space-y-4">
                                        {/* Personal Details */}
                                        {(selectedService.formFields?.requiresPersonalDetails !== false) && (
                                            <>
                                                <div>
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Booking Date */}
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Booking Date</label>
                                            <input
                                                type="date"
                                                name="bookingDate"
                                                value={formData.bookingDate}
                                                onChange={handleFormChange}
                                                required
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                            />
                                        </div>

                                        {/* Quantity (for per item pricing) */}
                                        {selectedService.formFields?.isPerItemPricing && (
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Pages/Quantity</label>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleFormChange}
                                                    min="1"
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                />
                                            </div>
                                        )}

                                        {/* Form Name */}
                                        {selectedService.formFields?.requiresFormName && (
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Form Name</label>
                                                <input
                                                    type="text"
                                                    name="formName"
                                                    value={formData.formName}
                                                    onChange={handleFormChange}
                                                    required
                                                    placeholder="e.g., Passport Application"
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                />
                                            </div>
                                        )}

                                        {/* Pickup Time */}
                                        {selectedService.formFields?.requiresPickupTime && (
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Pickup Time</label>
                                                <input
                                                    type="time"
                                                    name="pickupTime"
                                                    value={formData.pickupTime}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                />
                                            </div>
                                        )}

                                        {/* Travel Details */}
                                        {selectedService.formFields?.requiresTravelDetails && (
                                            <>
                                                <div>
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">From Location</label>
                                                    <input
                                                        type="text"
                                                        name="travelFrom"
                                                        value={formData.travelFrom}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">To Location</label>
                                                    <input
                                                        type="text"
                                                        name="travelTo"
                                                        value={formData.travelTo}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Document Upload */}
                                        {selectedService.formFields?.requiresDocuments && (
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                                    Upload Documents
                                                    {selectedService.formFields.documentTypes?.length > 0 &&
                                                        <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">({selectedService.formFields.documentTypes.join(', ')})</span>
                                                    }
                                                </label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    onChange={handleFileUpload}
                                                    className="w-full text-sm text-gray-700 dark:text-gray-300"
                                                />
                                                {formData.documents.length > 0 && (
                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">{formData.documents.length} file(s) selected</p>
                                                )}
                                            </div>
                                        )}

                                        {/* EMI Option */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="useEMI"
                                                    checked={formData.useEMI}
                                                    onChange={handleFormChange}
                                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/40"
                                                />
                                                <span className="font-bold text-gray-700 dark:text-gray-300">Pay in EMI</span>
                                            </label>

                                            {formData.useEMI && (
                                                <div className="mt-3">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Number of Months</label>
                                                    <select
                                                        name="emiMonths"
                                                        value={formData.emiMonths}
                                                        onChange={handleFormChange}
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/40"
                                                    >
                                                        <option value="3">3 Months</option>
                                                        <option value="6">6 Months</option>
                                                        <option value="12">12 Months</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Amount Display */}
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">Service Price:</span>
                                                <span className="font-bold text-gray-900 dark:text-white">Rs. {selectedService.price}</span>
                                            </div>
                                            {selectedService.formFields?.isPerItemPricing && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{formData.quantity}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between items-center">
                                                <span className="font-bold text-gray-700 dark:text-gray-300">Total Amount:</span>
                                                <span className="text-2xl font-black text-orange-500">Rs. {calculateAmount(selectedService, formData.quantity)}</span>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-[#0b132b] dark:bg-orange-500 hover:bg-gray-800 dark:hover:bg-orange-600 disabled:opacity-60 text-white dark:text-[#0b132b] font-black py-3 px-4 rounded-lg transition-colors"
                                        >
                                            {isSubmitting ? "Booking..." : "Confirm Booking"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedService(null)}
                                            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
