import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../service/authService.js";
import google_icon from "../../assets/google-icon.png";
import background from "../../assets/login1.png";
import { toast } from "react-toastify";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [login] = useLoginMutation();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username.trim()) {
            setError("Username cannot be empty");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await login({ username, password }).unwrap();
            console.log("Login Response:", response);

            if (response.token) {
                // ✅ You already saved jwt_token, username, role, exp inside `authService`
                // No need to decode and save again here!

                toast.success("Đăng nhập thành công!", { autoClose: 1500 });

                // Delay small time to make sure everything saved
                setTimeout(() => {
                    navigate("/");
                }, 800);
            } else {
                setError("Unexpected response from server");
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err?.data?.error) {
                setError(err.data.error);
            } else if (err.status === 401) {
                setError("Incorrect credentials");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    const handleForgotPassword = () => navigate("/forgot-password");
    const handleRegister = () => navigate("/register");

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background */}
            <div style={{ backgroundImage: `url(${background})` }} className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50"></div>

            {/* Logo */}
            <div className="absolute top-5 left-5">
                <h1 className="text-red-600 text-4xl font-bold">GoBeyond</h1>
            </div>

            {/* Login Form */}
            <div className="relative flex items-center justify-center h-screen">
                <div className="w-full max-w-md bg-black bg-opacity-80 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-white text-center mb-6">Đăng nhập</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Username */}
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        {/* Password */}
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        {/* Error */}
                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition duration-200"
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center justify-center my-4">
                            <div className="w-1/3 border-b border-gray-500"></div>
                            <span className="mx-2 text-gray-400 text-sm">HOẶC</span>
                            <div className="w-1/3 border-b border-gray-500"></div>
                        </div>

                        {/* Google Login */}
                        <button
                            type="button"
                            onClick={loginWithGoogle}
                            className="w-full flex items-center justify-center bg-white text-black font-medium py-3 rounded-md border border-gray-400 hover:bg-gray-100 transition"
                        >
                            <img src={google_icon} alt="Google" className="h-5 w-5 mr-2" />
                            Đăng nhập bằng Google
                        </button>

                        {/* Forgot Password */}
                        <div className="text-right mt-4">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        {/* Register */}
                        <div className="text-center text-gray-400 text-sm">
                            <p>
                                Bạn mới sử dụng GoBeyond?{" "}
                                <button onClick={handleRegister} className="text-white hover:underline">
                                    Đăng ký ngay
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
