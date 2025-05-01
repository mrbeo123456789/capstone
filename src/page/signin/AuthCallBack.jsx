import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("jwt_token", token);
            navigate("/homepage", { replace: true });
        } else {
            navigate("/login?error=true");
        }
    }, [location, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <h2 className="text-center">Đang xử lý đăng nhập...</h2>
        </div>
    );
};

export default AuthCallback;
