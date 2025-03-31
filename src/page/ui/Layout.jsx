import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { SideBar } from "./SideBar.jsx";
import {useSidebar} from "../../context/SidebarContext.jsx";

function Layout() {
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    console.log("isSidebarOpen in Layout:", isSidebarOpen);

    return (
        <>
            <div className="sticky top-0 z-50">
            <Header toggleSidebar={toggleSidebar}/>
            </div>
            <div
                className="sm:flex items-start justify-between"
                style={{
                    background: "linear-gradient(235deg, rgb(254 225 144), rgb(250 241 221), rgb(252 247 226))",
                }}
            >
                {isSidebarOpen && <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
                <div className={`w-full transition-all duration-300 pl-0 md:p-4 md:space-y-4`}>
                    <Outlet />
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Layout;
