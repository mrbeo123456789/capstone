import {Outlet, useLocation} from "react-router-dom";
import {Header} from "./Header.jsx";
import {Footer} from "./Footer.jsx";
import {SideBar} from "./SideBar.jsx";
import {useState} from "react";

function Layout() {
    const location = useLocation(); // Get current route
    const [showSidebar, setShowSidebar] = useState(false); // Sidebar state

    return (
        <>
            <Header />
            <div
                className="flex items-start justify-between"
                style={{
                    background: "linear-gradient(235deg, rgb(79 15 103), rgb(123 4 48), rgb(65 2 2))",
                }}
            >
                {/* ✅ Sidebar logic */}
                {location.pathname !== "/homepage" ? (
                    <SideBar /> // Show sidebar normally
                ) : (
                    showSidebar && <SideBar /> // Show when toggled on homepage
                )}

                <div className="flex flex-col w-full pl-0 md:p-4 md:space-y-4">
                    {/* ✅ Toggle Sidebar Button (Only for Homepage) */}
                    {location.pathname === "/homepage" && (
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="absolute bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition"
                        >
                            {showSidebar ? "✖ Menu" : "☰ Menu"}
                        </button>
                    )}

                    <Outlet />
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Layout;