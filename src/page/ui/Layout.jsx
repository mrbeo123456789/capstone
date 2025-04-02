import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { SideBar } from "./SideBar.jsx";
import {useSidebar} from "../../context/SidebarContext.jsx";

function Layout() {
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    return (
        <>
            {/* Header luôn ở trên cùng, full width */}
            <div className="sticky top-0 z-50 w-full">
                <Header toggleSidebar={toggleSidebar} />
            </div>

            {/* Body layout: Sidebar dưới header và nằm bên trái */}
            <div className="flex min-h-screen bg-[linear-gradient(235deg,_rgb(254,225,144),_rgb(250,241,221),_rgb(252,247,226))]">

                {/* Sidebar chỉ chiếm chiều cao còn lại sau header */}
                <div>
                    {isSidebarOpen && <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
                </div>

                {/* Nội dung chính */}
                <div className="flex-1 p-4 space-y-4">
                    <Outlet />

                </div>
            </div>
            <Footer />
        </>
    );
}


export default Layout;
