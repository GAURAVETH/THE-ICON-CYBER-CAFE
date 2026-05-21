import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-[#f8f9fc] dark:bg-gray-900 py-10 px-6 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Brand / Logo */}
                <div className="flex items-center gap-3">
                    <div className="bg-[#0b132b] dark:bg-orange-500 w-8 h-8 rounded flex justify-center items-center">
                        <div className="w-3 h-3 border-2 border-orange-500 dark:border-[#0b132b] transform rotate-45"></div>
                    </div>
                    <span className="font-extrabold text-[#0b132b] dark:text-white tracking-wider text-lg">
                        ICON CYBER CAFE
                    </span>
                </div>

                {/* Copyright & Links */}
                <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        &copy; {new Date().getFullYear()} Icon Cyber Cafe. All rights reserved.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Developed by{" "}
                        <a 
                            href="https://codezgaurav.netlify.app" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-bold transition-colors"
                        >
                            Codezgaurav
                        </a>
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;