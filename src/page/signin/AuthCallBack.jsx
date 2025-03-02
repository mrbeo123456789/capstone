import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserQuery } from "../../service/authService.js";

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/auth/oauth2-login", {
                    method: "GET",
                    credentials: "include", // Nếu backend dùng cookie để lưu session
                });

                if (!response.ok) {
                    throw new Error("Không thể đăng nhập bằng Google!");
                }

                const data = await response.json();
                const token = data.token;

                if (token) {
                    localStorage.setItem("jwt_token", token);
                    navigate("/dashboard");
                } else {
                    throw new Error("Token không hợp lệ!");
                }
            } catch (error) {
                console.error("Lỗi đăng nhập:", error);
                setError("Đăng nhập thất bại. Vui lòng thử lại.");
                navigate("/login?error=true");
            }
        };

        fetchToken();
    }, [navigate("/dashboard")]);

    return (
        <div className="flex justify-center items-center h-screen">
            {error ? (
                <h2 className="text-red-500">{error}</h2>
            ) : (
                <h2 className="text-center">Đang xử lý đăng nhập...</h2>
            )}
        </div>
    );
};

export default AuthCallback;
