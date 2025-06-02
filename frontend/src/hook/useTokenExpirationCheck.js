import { useEffect } from "react";
import { toast } from "react-toastify";

export default function useTokenExpirationCheck() {
    useEffect(() => {
        const checkExpiration = () => {
            const token = localStorage.getItem("jwt_token");
            const exp = localStorage.getItem("exp");

            if (token && exp) {
                const now = Date.now();
                const expTime = parseInt(exp, 10) * 1000;

                if (now > expTime) {
                    console.warn("🔴 Token expired detected globally!");

                    toast.error("Your session expired. Please log in again.", {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });

                    setTimeout(() => {
                        localStorage.clear();
                        window.location.href = "/login"; // 🔥 Force logout
                    }, 3200);
                }
            }
        };

        // 👉 Check immediately when hook mounts
        checkExpiration();

        // 👉 Re-check every 60 seconds
        const interval = setInterval(checkExpiration, 60000);

        return () => clearInterval(interval);
    }, []);
}
