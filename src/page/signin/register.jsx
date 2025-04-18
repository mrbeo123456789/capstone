import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useRegisterMutation } from "../../service/authService.js";
import { useNavigate } from "react-router-dom";
import background from "../../assets/login.png";

const RegisterForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState({});
    const [register, { isLoading }] = useRegisterMutation();
    const navigate = useNavigate();

    // Validate email phải có đuôi "@email.com"
    const validateEmail = (email) => {
        return /^[a-zA-Z0-9._%+-]+@/.test(email);
    };

    // Validate password: ít nhất 8 ký tự, có chữ hoa, chữ thường và số
    const validatePassword = (password) => {
        return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password);
    };

    // Validate toàn bộ form
    const validateForm = () => {
        let errors = {};

        if (!email) {
            errors.email = "Email không được để trống.";
        } else if (!validateEmail(email)) {
            errors.email = "Email phải có đuôi '@'.";
        }

        if (!username) {
            errors.username = "Tên đăng nhập không được để trống.";
        }

        if (!password) {
            errors.password = "Mật khẩu không được để trống.";
        } else if (!validatePassword(password)) {
            errors.password = "Mật khẩu ít nhất 8 ký tự, có chữ hoa, chữ thường và số.";
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        }

        setError(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError({});

        if (!validateForm()) return;

        try {
            await register({ email, username, password }).unwrap();
            navigate("/enter-otp");
        } catch (err) {
            setError({ api: err?.data?.message || "Đăng ký thất bại. Vui lòng thử lại." });
        }
    };

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background */}
            <div
                style={{ backgroundImage: `url(${background})` }}
                className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50"
            ></div>

            {/* Logo */}
            <div className="absolute top-5 left-5">
                <h1 className="text-red-600 text-4xl font-bold">GoBeyond</h1>
            </div>

            {/* Register Form */}
            <div className="relative flex items-center justify-center h-screen">
                <div className="w-full max-w-md bg-black bg-opacity-80 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-white text-center mb-6">Đăng ký</h2>

                    {/* Thông báo lỗi API */}
                    {error.api && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm mb-4">
                            {error.api}
                        </div>
                    )}

                    {/* Form đăng ký */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Email (@email.com)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-red-500"
                            />
                            {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-red-500"
                            />
                            {error.username && <p className="text-red-500 text-sm">{error.username}</p>}
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-red-500"
                            />
                            {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-red-500"
                            />
                            {error.confirmPassword && <p className="text-red-500 text-sm">{error.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center justify-center my-4">
                        <div className="w-1/3 border-b border-gray-500"></div>
                        <span className="mx-2 text-gray-400 text-sm">HOẶC</span>
                        <div className="w-1/3 border-b border-gray-500"></div>
                    </div>

                    {/* Google Register Button */}
                    <button className="w-full flex items-center justify-center bg-white text-black font-medium py-3 rounded-md border border-gray-400 hover:bg-gray-100 transition duration-200">
                        <FaGoogle className="mr-2" /> Đăng ký bằng Google
                    </button>

                    {/* Chuyển hướng đến đăng nhập */}
                    <p className="text-center text-gray-400 text-sm mt-4">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-white hover:underline">
                            Đăng nhập ngay.
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
