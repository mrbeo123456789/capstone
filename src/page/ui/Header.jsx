import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

const Header = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        navigate("/login");
    };

    const menuItems = [
        { href: "/aboutus", title: "About", text: "About" },
        { href: "/guide", title: "Guide", text: "Guide" },
        { href: "/challenges", title: "Challenges", text: "Challenges" },
        { href: "/ranking", title: "Leaderboard", text: "Leaderboard" },
        { href: "/news", title: "News", text: "News" },
    ];

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 shadow-lg border-b border-white/20 h-20 flex items-center px-4">

            <div className="flex justify-between items-center w-full">
                {/* Left: Sidebar toggle + Logo */}
                <div className="flex items-center space-x-4">
                    <button className="flex flex-col space-y-1" onClick={toggleSidebar}>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                    </button>
                    <a href="/" className="flex items-center">
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                            alt="GoBeyond"
                            className="h-10 rounded-full"
                        />
                        <div className="flex">
                            <div className="text-xl font-bold text-white">Go</div>
                            <div className="text-xl font-bold text-yellow-400">Beyond</div>
                        </div>
                    </a>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden md:flex space-x-6">
                    <ul className="flex space-x-4">
                    {menuItems.map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    title={item.title}
                                    className="text-white hover:text-red-200 transition font-medium"
                                >
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Right: Flag, Search, Avatar, Logout */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:block">
                        <img
                            title="Vietnamese"
                            src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                            alt="Vietnamese"
                            className="h-6 w-8 rounded"
                        />
                    </div>

                    <button type="button">
                        <i className="fa fa-search text-black hover:text-red-200 text-lg"></i>
                    </button>

                    <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
                    />

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-white hover:text-red-200 transition font-medium"
                    >
                        <FiLogOut className="text-xl"/>
                        <span className="hidden sm:block">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
