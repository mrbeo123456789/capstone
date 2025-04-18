import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    MenuSquare,
    Users,
    FileText,
    AlertTriangle,
    PlusCircle,
    UserSquare,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    LogOut,
    List,
    BarChart
} from "lucide-react";

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed);
    const [isChallengeMenuOpen, setIsChallengeMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Check if current path is under challenge management
    useEffect(() => {
        const challengePaths = ['/admin/challengelist', '/admin/challenge/create', '/admin/challenge/statistics'];
        const shouldOpenChallengeMenu = challengePaths.some(path => location.pathname.startsWith(path));
        setIsChallengeMenuOpen(shouldOpenChallengeMenu);
    }, [location.pathname]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const toggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        setSidebarCollapsed(newCollapsedState);
    };

    const toggleChallengeMenu = () => setIsChallengeMenuOpen(!isChallengeMenuOpen);

    const handleHomepage = () => navigate("/admin/dashboard");

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        navigate("/login");
    };

    const activeClasses = "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-medium";
    const hoverClasses = "hover:bg-gray-100";

    // Check if a challenge management route is active
    const isChallengeRouteActive = () => {
        return ['/admin/challengelist', '/admin/challenge/create', '/admin/challenge/statistics'].some(
            path => location.pathname.startsWith(path)
        );
    };

    // Challenge submenu items
    const challengeSubMenuItems = [
        {
            path: "/admin/challengelist",
            icon: <List size={18} />,
            title: "List"
        },
        {
            path: "/admin/challenge/create",
            icon: <PlusCircle size={18} />,
            title: "Create"
        },
        {
            path: "/admin/challenge/statistics",
            icon: <BarChart size={18} />,
            title: "Stats"
        }
    ];

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

            {/* Sidebar Container */}
            <div
                className={`bg-white text-gray-700 h-screen fixed left-0 top-0 z-40 ${
                    isCollapsed ? "w-16" : "w-64"
                } shadow-lg transition-all duration-300 transform ${
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                {/* Logo */}
                <div className="py-6 px-4 bg-orange-50 flex justify-between items-center">
                    {!isCollapsed ? (
                        <div onClick={handleHomepage} className="text-orange-600 text-2xl font-bold cursor-pointer">
                            GOBEYOND
                        </div>
                    ) : (
                        <div onClick={handleHomepage} className="text-orange-600 text-2xl font-bold mx-auto cursor-pointer">
                            G
                        </div>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:block p-1 rounded-full hover:bg-orange-100 text-orange-500"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="mt-4 px-2 overflow-y-auto h-[calc(100vh-140px)]">
                    <ul className="space-y-2">
                        {/* Dashboard */}
                        <li>
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive ? activeClasses : hoverClasses
                                    }`
                                }
                                title="Dashboard"
                            >
                                <FileText size={20} className={isCollapsed ? "" : "mr-3"} />
                                {!isCollapsed && <span>Dashboard</span>}
                            </NavLink>
                        </li>

                        {/* Challenge Management with toggle */}
                        <li className="relative">
                            <div className="flex flex-col">
                                <button
                                    onClick={toggleChallengeMenu}
                                    className={`flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4 justify-between w-full"
                                    } py-3 rounded-md transition duration-200 ${
                                        isChallengeRouteActive() && !isChallengeMenuOpen ? activeClasses : hoverClasses
                                    } w-full`}
                                    title="Challenge Management"
                                >
                                    <div className="flex items-center">
                                        <MenuSquare size={20} className={isCollapsed ? "" : "mr-3"} />
                                        {!isCollapsed && <span>Challenge Management</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <ChevronDown
                                            size={20}
                                            className={`transition-transform duration-200 ${
                                                isChallengeMenuOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    )}
                                </button>

                                {/* Horizontal submenu items for expanded sidebar */}
                                {!isCollapsed && isChallengeMenuOpen && (
                                    <div className="mt-1 mb-1 flex bg-orange-50 rounded-md overflow-hidden">
                                        {challengeSubMenuItems.map((item, index) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `flex items-center justify-center py-2 px-2 flex-1 transition duration-200 ${
                                                        isActive ? "bg-orange-100 text-orange-600 font-medium" : "hover:bg-orange-100"
                                                    } ${index !== 0 ? "border-l border-orange-200" : ""}`
                                                }
                                                title={item.title}
                                            >
                                                <div className="mr-1">{item.icon}</div>
                                                <span className="text-sm">{item.title}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mini dropdown for collapsed sidebar */}
                            {isCollapsed && isChallengeMenuOpen && (
                                <div className="absolute left-16 top-0 bg-white shadow-lg rounded-md py-2 min-w-48 z-50">
                                    <div className="px-4 py-2 font-medium border-b border-gray-100 text-orange-600">
                                        Challenge Management
                                    </div>
                                    {challengeSubMenuItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-2 transition duration-200 ${
                                                    isActive ? activeClasses : hoverClasses
                                                }`
                                            }
                                            title={item.title}
                                        >
                                            <div className="mr-3">{item.icon}</div>
                                            <span>{item.title}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </li>

                        {/* User Management */}
                        <li>
                            <NavLink
                                to="/admin/userlist"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive ? activeClasses : hoverClasses
                                    }`
                                }
                                title="User Management"
                            >
                                <Users size={20} className={isCollapsed ? "" : "mr-3"} />
                                {!isCollapsed && <span>User Management</span>}
                            </NavLink>
                        </li>

                        {/* Group Management */}
                        <li>
                            <NavLink
                                to="/admin/groupmanagement"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive ? activeClasses : hoverClasses
                                    }`
                                }
                                title="Group Management"
                            >
                                <UserSquare size={20} className={isCollapsed ? "" : "mr-3"} />
                                {!isCollapsed && <span>Group Management</span>}
                            </NavLink>
                        </li>

                        {/* Report Management */}
                        <li>
                            <NavLink
                                to="/admin/reports"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive ? activeClasses : hoverClasses
                                    }`
                                }
                                title="Report Management"
                            >
                                <AlertTriangle size={20} className={isCollapsed ? "" : "mr-3"} />
                                {!isCollapsed && <span>Report Management</span>}
                            </NavLink>
                        </li>

                        {/* Settings */}
                        <li>
                            <NavLink
                                to="/admin/settings"
                                className={({ isActive }) =>
                                    `flex items-center ${
                                        isCollapsed ? "justify-center" : "px-4"
                                    } py-3 rounded-md transition duration-200 ${
                                        isActive ? activeClasses : hoverClasses
                                    }`
                                }
                                title="Settings"
                            >
                                <PlusCircle size={20} className={isCollapsed ? "" : "mr-3"} />
                                {!isCollapsed && <span>Settings</span>}
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${
                            isCollapsed ? "justify-center" : "px-4"
                        } py-3 rounded-md transition duration-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700 w-full`}
                        title="Logout"
                    >
                        <LogOut size={20} className={isCollapsed ? "" : "mr-3"} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
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