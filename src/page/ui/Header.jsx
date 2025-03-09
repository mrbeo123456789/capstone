import React from "react";

export const Header = () => {
    const menuItems = [
        { href: "/about", title: "About", text: "About" },
        { href: "/guide", title: "Guide", text: "Guide" },
        { href: "/challenges", title: "Challenges", text: "Challenges" },
        { href: "/ranking", title: "Leaderboard", text: "Leaderboard" },
        { href: "/news", title: "News", text: "News" },
    ];

    return (
        <header className="bg-[#410808] shadow-md py-4 w-full z-50">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo */}
                <h2 className="text-xl font-bold flex items-center space-x-2">
                    <a href="/" className="flex items-center">
                        <img
                            src="https://via.placeholder.com/40" // Placeholder Logo
                            alt="GoBeyond"
                            className="h-10 rounded-full"
                        />
                        <span className="ml-2 text-orange-400 font-bold text-lg">GoBeyond</span>
                    </a>
                </h2>

                {/* Navigation Menu */}
                <nav className="hidden md:flex space-x-6">
                    <ul className="flex space-x-4">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    title={item.title}
                                    className="text-orange-300 hover:text-red-500 transition font-medium"
                                >
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Language Selector */}
                <div className="relative">
                    <button className="btn btn-primary dropdown-toggle">
                        <img
                            title="Vietnamese"
                            src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                            alt="Vietnamese"
                            className="h-6 w-8 rounded"
                        />
                    </button>
                </div>

                {/* Search & User Avatar */}
                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="relative">
                        <button type="button">
                            <i className="fa fa-search text-orange-300 hover:text-red-500 text-lg"></i>
                        </button>
                    </div>

                    {/* User Avatar */}
                    <div>
                        <img
                            src="https://randomuser.me/api/portraits/men/32.jpg" // Placeholder User Avatar
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full border-2 border-orange-400 cursor-pointer"
                        />
                    </div>

                    {/* Mobile Menu Icon */}
                    <button className="md:hidden flex flex-col space-y-1">
                        <span className="block w-6 h-1 bg-orange-400"></span>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                        <span className="block w-6 h-1 bg-orange-400"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};