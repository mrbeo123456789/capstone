import React, { useState } from "react";
import Sidebar from "./SideBar.jsx";
import Header from "./Header.jsx";
import {Outlet} from "react-router-dom";

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[url('https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd')]
        bg-fixed bg-cover bg-center">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}/>
            <Sidebar isOpen={isSidebarOpen}/>
            <main
                className={`pt-20 transition-all duration-300 min-h-screen content-center ${
                    isSidebarOpen ? "ml-14 md:ml-64" : "ml-0"
                }`}
            >
                <div className="mx-4 my-4"><Outlet/></div>
            </main>
        </div>
    );
};

export default Layout;
