import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    MenuSquare,
    Users,
    FileText,
    AlertTriangle,
    PlusCircle,
    UserSquare,
    ChevronRight,
    LogOut,
    ChevronLeft,
} from "lucide-react";

// eslint-disable-next-line react/prop-types
const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        setSidebarCollapsed(!sidebarCollapsed);
    };
    const handleHomepage = () => {
        navigate("/admin/dashboard");
    }

    const handleLogout = () => {
        // Xóa JWT token và chuyển hướng về trang login
        localStorage.removeItem("jwt_token");
        navigate("/login");
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 bg-white rounded-md text-gray-700 hover:bg-gray-100 shadow-md"
                >
                    <MenuSquare size={24} />
                </button>
            </div>

            {/* Sidebar Container - hidden on mobile unless toggled */}
            <div
                className={`bg-white text-gray-700 h-screen fixed left-0 top-0 z-40 ${
                    isCollapsed ? "w-16" : "w-64"
                } shadow-lg transition-all duration-300 transform 
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                {/* Logo Container */}
                <div  className="py-6 px-4 bg-orange-50 flex justify-between items-center">
                    {!isCollapsed && (
                        <div onClick={handleHomepage} className="text-orange-600 text-2xl font-bold">
                            GOBEYOND
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="text-orange-600 text-2xl font-bold mx-auto">
                            G
                        </div>
                    )}

                    {/* Collapse/Expand toggle button - hidden on mobile */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:block p-1 rounded-full hover:bg-orange-100 text-orange-500"
                    >
                        {isCollapsed ? (
                            <ChevronRight size={20} />
                        ) : (
                            <ChevronLeft size={20} />
                        )}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="mt-4 px-2">
                    <ul className="space-y-2">
                        <li>
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-medium"
                                            : "hover:bg-gray-100"
                                    }`
                                }
                                title="Dashboard"
                            >
                                <FileText
                                    size={20}
                                    className={isCollapsed ? "" : "mr-3"}
                                />
                                {!isCollapsed && <span>Dashboard</span>}
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/admin/challengelist"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-medium"
                                            : "hover:bg-gray-100"
                                    }`
                                }
                                title="Challenge List"
                            >
                                <MenuSquare
                                    size={20}
                                    className={isCollapsed ? "" : "mr-3"}
                                />
                                {!isCollapsed && <span>Challenge List</span>}
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/admin/userlist"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-medium"
                                            : "hover:bg-gray-100"
                                    }`
                                }
                                title="User List"
                            >
                                <Users
                                    size={20}
                                    className={isCollapsed ? "" : "mr-3"}
                                />
                                {!isCollapsed && <span>User List</span>}
                            </NavLink>
                        </li>

                        {/* Group List with dropdown */}
                        <li>
                            <NavLink
                                to="/admin/grouplist"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-medium"
                                            : "hover:bg-gray-100"
                                    }`
                                }
                                title="Group List"
                            >
                                <UserSquare
                                    size={20}
                                    className={isCollapsed ? "" : "mr-3"}
                                />
                                {!isCollapsed && <span>Group List</span>}
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/admin/reportlist"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-medium"
                                            : "hover:bg-gray-100"
                                    }`
                                }
                                title="Report List"
                            >
                                <AlertTriangle
                                    size={20}
                                    className={isCollapsed ? "" : "mr-3"}
                                />
                                {!isCollapsed && <span>Report List</span>}
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="admin/settings"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-medium"
                                            : "hover:bg-gray-100"
                                    }`
                                }
                                title="Settings"
                            >
                                <PlusCircle
                                    size={20}
                                    className={isCollapsed ? "" : "mr-3"}
                                />
                                {!isCollapsed && <span>Settings</span>}
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Logout section at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${
                            isCollapsed ? "justify-center" : "px-4"
                        } py-3 rounded-md transition duration-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700`}
                        title="Logout"
                    >
                        <LogOut size={20} className={isCollapsed ? "" : "mr-3"} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Overlay for mobile - closes sidebar when clicking outside */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleMobileMenu}
                />
            )}
        </>
    );
};

export default Sidebar;
