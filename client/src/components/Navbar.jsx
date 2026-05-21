import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const profileMenuRef = useRef(null);

    // Reference for GSAP animations
    const navRef = useRef(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        setIsProfileMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navLinks = [
        { name: "HOME", path: "/" },
        { name: "SERVICES", path: "/services" },
    ];

    if (user) {
        if (user.role === "admin") {
            navLinks.push({ name: "ADMIN", path: "/admin" });
        } else {
            navLinks.push({ name: "DASHBOARD", path: "/dashboard" });
            navLinks.push({ name: "BOOKINGS", path: "/bookings" });
        }
    } else {
        navLinks.push({ name: "LOGIN", path: "/login" });
    }

    // GSAP: Initial Page Load Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".nav-item", {
                y: -20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
            });
        }, navRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={navRef} className="sticky top-0 z-50">
            {/* Main Navbar */}
            <nav className="bg-[#f8f9fc]/70 dark:bg-gray-900/70 backdrop-blur-xl w-full px-6 py-4 shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    {/* Logo Section */}
                    <Link to="/" className="nav-item flex items-center gap-3">
                        <div className="bg-[#0b132b] dark:bg-orange-500 w-10 h-10 rounded-lg flex justify-center items-center">
                            <div className="w-4 h-4 border-2 border-orange-500 dark:border-[#0b132b] transform rotate-45"></div>
                        </div>
                        <h1 className="text-xl font-extrabold text-[#0b132b] dark:text-white tracking-wide">
                            ICON CYBER CAFE
                        </h1>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex gap-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="nav-item text-gray-500 dark:text-gray-400 hover:text-[#0b132b] dark:hover:text-white font-semibold text-sm tracking-wider transition-colors relative group"
                            >
                                {link.name}
                                {/* CSS animated underline on hover */}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center gap-4 nav-item">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            {theme === 'light' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                </svg>
                            )}
                        </button>

                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button 
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <img 
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0b132b&color=fff`} 
                                        alt="Profile" 
                                        className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover"
                                    />
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                            </div>
                                            <Link 
                                                to="/profile" 
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Profile Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/register">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-[#0b132b] dark:bg-orange-500 hover:bg-gray-800 dark:hover:bg-orange-600 text-white dark:text-[#0b132b] font-bold py-2 px-5 rounded-full text-sm tracking-wider shadow-md transition-colors"
                                >
                                    SIGN UP
                                </motion.button>
                            </Link>
                        )}
                    </div>

                    {/* Hamburger Menu Icon for Mobile */}
                    <div className="md:hidden flex items-center gap-4 nav-item">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            {theme === 'light' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={toggleMobileMenu}
                            className="text-[#0b132b] dark:text-white hover:text-gray-600 focus:outline-none"
                        >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Framer Motion: Mobile Side Navbar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={toggleMobileMenu}
                        />

                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-5 flex justify-between items-center border-b dark:border-gray-800">
                                <span className="font-extrabold text-[#0b132b] dark:text-white">MENU</span>
                                <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-red-500">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-col gap-4 p-5 flex-grow">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * i, duration: 0.3 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={toggleMobileMenu}
                                            className="text-gray-600 dark:text-gray-300 hover:text-[#0b132b] dark:hover:text-white font-semibold text-lg block"
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                                
                                {user && (
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * navLinks.length, duration: 0.3 }}
                                    >
                                        <Link
                                            to="/profile"
                                            onClick={toggleMobileMenu}
                                            className="text-gray-600 dark:text-gray-300 hover:text-[#0b132b] dark:hover:text-white font-semibold text-lg block"
                                        >
                                            PROFILE
                                        </Link>
                                    </motion.div>
                                )}

                                <motion.div
                                    className="mt-8"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.3 }}
                                >
                                    {user ? (
                                        <button
                                            onClick={() => { handleLogout(); toggleMobileMenu(); }}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full text-sm tracking-wider shadow-lg"
                                        >
                                            LOGOUT
                                        </button>
                                    ) : (
                                        <Link to="/register" onClick={toggleMobileMenu}>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                className="w-full bg-[#0b132b] dark:bg-orange-500 text-white dark:text-[#0b132b] font-bold py-3 px-6 rounded-full text-sm tracking-wider shadow-lg"
                                            >
                                                SIGN UP
                                            </motion.button>
                                        </Link>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;
