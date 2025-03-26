import React, { createContext, useContext, useState } from "react";

// Create the Sidebar context
const SidebarContext = createContext();

// SidebarProvider component to wrap your app
export const SidebarProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
        console.log("Sidebar state changed:", !isSidebarOpen);
    };

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

// Custom hook to use the Sidebar context
export const useSidebar = () => {
    return useContext(SidebarContext);
};
