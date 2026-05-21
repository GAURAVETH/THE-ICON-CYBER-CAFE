import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../services/api";

const Home = () => {
    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchFeaturedServices = async () => {
            try {
                // First try to get admin-featured services
                const { data } = await API.get("/services?isFeatured=true&limit=3");
                if (data.data && data.data.length > 0) {
                    setServices(data.data.slice(0, 3));
                } else {
                    // Fallback to top 3 most booked services
                    const fallbackRes = await API.get("/services?sort=-currentBookings&limit=3");
                    setServices(fallbackRes.data.data.slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to fetch featured services", err);
            }
        };

        fetchFeaturedServices();
    }, []);

    // Animation variants for Framer Motion
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
        },
    };

    return (
        <div className="bg-[#fafbfc] dark:bg-gray-900 min-h-screen font-sans text-[#0b132b] dark:text-white transition-colors duration-200">

            {/* ================= HERO SECTION ================= */}
            <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:py-24">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

                    {/* Left Text Content */}
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="lg:w-1/2 flex flex-col items-start"
                    >
                        <motion.div variants={fadeUp} className="bg-[#fdf4eb] dark:bg-orange-900/30 text-[#c28052] dark:text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-8">
                            Established 2012 • Govt. Authorized Center
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight text-[#0b132b] dark:text-white">
                            Your Digital <br />
                            <span className="text-[#2563eb] dark:text-orange-500">Bridge</span> to <br />
                            Success.
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 text-lg md:text-xl mb-10 max-w-md leading-relaxed">
                            From government certificates to website development, accurate, fast and trusted services for every citizen and business.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                            <Link to="/services" className="bg-[#2563eb] dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white dark:text-[#0b132b] font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-orange-500/20 transition-all flex items-center gap-2">
                                Book a Service
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                            <Link to="/services" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 text-[#0b132b] dark:text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm">
                                Browse Services
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Image Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:w-1/2 relative w-full"
                    >
                        {/* Using a placeholder image for the lab. Replace src with your actual image */}
                        <img
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Cyber Cafe Office"
                            className="rounded-3xl shadow-2xl object-cover w-full h-[400px] md:h-[500px]"
                        />

                        {/* Floating Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
                            className="absolute -bottom-6 -left-6 md:-left-12 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl flex items-center gap-4 w-72 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="bg-[#d1fae5] dark:bg-green-900/30 p-3 rounded-full text-[#10b981] dark:text-green-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-[#0b132b] dark:text-white">5,000+ Certificates<br />Issued</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Verified Government Partner</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ================= STATS SECTION ================= */}
            <motion.section
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200 dark:border-gray-800"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { num: "12+", text: "YEARS OF SERVICE" },
                        { num: "50k+", text: "HAPPY CUSTOMERS" },
                        { num: "5,000+", text: "CERTIFICATES ISSUED" },
                        { num: "100%", text: "SECURE PAYMENTS" }
                    ].map((stat, i) => (
                        <motion.div key={i} variants={fadeUp} className="flex flex-col items-center">
                            <h2 className="text-4xl md:text-5xl font-black mb-2 text-[#0b132b] dark:text-white">{stat.num}</h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500 tracking-[0.2em] font-medium">{stat.text}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ================= SERVICES SECTION ================= */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <h2 className="text-4xl font-black mb-3 text-[#0b132b] dark:text-white">Essential Services</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Fast, accurate and professional assistance for every need.</p>
                    </div>
                    <Link to="/services" className="text-[#2563eb] dark:text-orange-500 font-bold flex items-center gap-1 hover:underline">
                        View Full Catalog <span className="text-xl"></span>
                    </Link>
                </div>

                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service, index) => {
                        const isDark = index % 3 === 2; // Make every 3rd card dark, matching original design
                        return (
                        <motion.div
                            key={service._id || index}
                            variants={fadeUp}
                            whileHover={{ y: -5 }}
                            className={`p-8 rounded-3xl border-2 flex flex-col justify-between transition-shadow duration-300 h-full min-h-[280px]
                ${isDark
                                    ? 'bg-[#0b132b] dark:bg-gray-800 border-[#0b132b] dark:border-gray-700 text-white shadow-2xl shadow-[#0b132b]/20 dark:shadow-none'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl'
                                }`}
                        >
                            <div>
                                {/* Number Badge */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-6
                  ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'}
                `}>
                                    0{index + 1}
                                </div>
                                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-[#0b132b] dark:text-white'}`}>
                                    {service.title}
                                </h3>
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} line-clamp-3`}>
                                    {service.description}
                                </p>

                                
                            </div>

                            {/* Footer (Price & Time) */}
                            <div className={`mt-8 pt-4 border-t flex justify-between items-center text-xs font-semibold
                ${isDark ? 'border-gray-700/50 text-gray-300' : 'border-gray-100 dark:border-gray-700 text-[#0b132b] dark:text-gray-300'}
              `}>
                                <span>Rs. {service.formFields?.isPerItemPricing ? `${service.formFields.itemPrice} per page` : service.price}</span>
                                <span className={isDark ? 'text-gray-400 font-normal' : 'text-gray-400 dark:text-gray-500 font-normal'}>
                                    {service.duration?.value} {service.duration?.unit}
                                </span>
                            </div>
                        </motion.div>
                    )})}
                </motion.div>
            </section>

            {/* ================= CTA BANNER SECTION ================= */}
            <motion.section
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto px-6 pb-24"
            >
                <div className="bg-[#0b132b] dark:bg-gray-800 rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl border border-transparent dark:border-gray-700">

                    {/* Left Side CTA text */}
                    <div className="md:w-1/2">
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                            Skip the queue. Book online.
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Tell us what you need. We will prepare your documents and call you when ready.
                        </p>
                    </div>

                    {/* Right Side Checklist & Button */}
                    <div className="md:w-1/2 flex flex-col gap-5 w-full md:items-end">
                        <ul className="space-y-4 text-gray-300 font-medium">
                            {[
                                "Priority processing for online bookings",
                                "Document checklist sent on WhatsApp",
                                "Pay only after work is verified"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-[#0b132b] font-black py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 w-full md:w-auto shadow-lg shadow-orange-500/20">
                            REQUEST CALLBACK
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>

                </div>
            </motion.section>

        </div>
    );
};

export default Home;
