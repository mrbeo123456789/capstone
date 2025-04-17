import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoGlobeOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import NotificationDropdown from "../../component/NotificationDropdown.jsx";
import { Link } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");

    const menuItems = [
        { href: "/aboutus", title: t('menu.about'), text: t('menu.about') },
        { href: "/challenges", title: t('menu.challenges'), text: t('menu.challenges') },
        { href: "/ranking", title: t('menu.leaderboard'), text: t('menu.leaderboard') },
        { href: "/news", title: t('menu.news'), text: t('menu.news') }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLanguageDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    useEffect(() => {
        const avatarFromStorage = localStorage.getItem("avatar");
        setAvatarUrl(avatarFromStorage || "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/avatar%2Fillustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg?alt=media&token=f5c7e08a-9e7d-467f-8eff-3c321824edcd"); // fallback if missing
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 shadow-lg border-b border-white/20 h-20 flex items-center px-4">
            <div className="flex justify-between items-center w-full">
                {/* Left: Sidebar + Logo */}
                <div className="flex items-center space-x-4">
                    <button className="flex flex-col space-y-1" onClick={toggleSidebar}>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                    </button>
                    <Link to="/homepage" className="flex items-center space-x-2">
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                            alt="GoBeyond"
                            className="h-10 rounded-full"
                        />
                        <div className="flex">
                            <div className="text-xl font-bold text-white">Go</div>
                            <div className="text-xl font-bold text-yellow-400">Beyond</div>
                        </div>
                    </Link>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden md:flex space-x-6">
                    <ul className="flex space-x-4">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.href}
                                    title={item.title}
                                    className="text-white hover:text-orange-300 transition font-medium"
                                >
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Right: Language + Avatar + Logout */}
                <div className="flex items-center space-x-4 relative">
                    {/* Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white/20 backdrop-blur-sm hover:bg-orange-400 hover:text-white transition"
                        >
                            <IoGlobeOutline className="text-xl" />
                        </button>

                        {languageDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg overflow-hidden">
                                {[
                                    { lng: "en", flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg", label: "English" },
                                    { lng: "vi", flag: "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg", label: "Tiếng Việt" },
                                    { lng: "jp", flag: "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg", label: "日本語" },
                                ].map(lang => (
                                    <button
                                        key={lang.lng}
                                        onClick={() => changeLanguage(lang.lng)}
                                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-orange-100"
                                    >
                                        <img src={lang.flag} alt={lang.label} className="w-5 h-5 rounded-sm object-cover" />
                                        <span className="text-sm font-medium">{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notification Dropdown */}
                    <NotificationDropdown />

                    {/* Avatar */}
                    <img
                        src={avatarUrl}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-white hover:text-red-200 transition font-medium"
                    >
                        <FiLogOut className="text-xl" />
                        <span className="hidden sm:block">{t('menu.logout')}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
