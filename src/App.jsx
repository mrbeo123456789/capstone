import { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext.jsx";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useTokenExpirationCheck from "./hook/useTokenExpirationCheck.js";

import router from './router/router.jsx';


const App = () => {
    const [loading, setLoading] = useState(true);

    useTokenExpirationCheck(); // ✅ Background check token expired

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        // return <SplashScreen />;
    }

    return (
        <>
            {/* Toast */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                transition={Bounce}
            />

            {/* Layout */}
            <SidebarProvider>
                <RouterProvider router={router} />
                {/* ChatBox Assistant luôn hiện ngoài cùng */}

            </SidebarProvider>
        </>
    );
};

export default App;
