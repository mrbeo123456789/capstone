import React, { useState } from "react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useRegisterMutation } from "../../service/authService.js";

const RegisterForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState({});
    const [register, { isLoading }] = useRegisterMutation();

    // Kiểm tra định dạng email hợp lệ
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Kiểm tra mật khẩu có ít nhất 6 ký tự, bao gồm chữ hoa và chữ thường
    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        return password.length >= 6 && hasUpperCase && hasLowerCase;
    };

    // Kiểm tra toàn bộ form
    const validateForm = () => {
        let errors = {};

        if (!email) {
            errors.email = "Email is required.";
        } else if (!validateEmail(email)) {
            errors.email = "Invalid email format.";
        }

        if (!username) {
            errors.username = "Username is required.";
        }

        if (!password) {
            errors.password = "Password is required.";
        } else if (!validatePassword(password)) {
            errors.password = "Password must be at least 6 characters and contain both uppercase and lowercase letters.";
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        setError(errors);
        return Object.keys(errors).length === 0;
    };

    // Xử lý đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();
        setError({});

        if (!validateForm()) return;

        try {
            const response = await register({ email, username, password });
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            console.log(response);
            window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
        } catch (err) {
            setError({ api: err.message || "Đăng ký thất bại" });
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-cover bg-center" style={{ backgroundImage: "url('/assets/background.jpg')" }}>
            <div className="flex bg-black/40 p-8 rounded-lg text-white w-full max-w-4xl shadow-lg">
                {/* Left Panel */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 bg-black/50 rounded-l-lg">
                    <h1 className="text-4xl font-bold mb-4">GoBe</h1>
                    <p className="text-lg mb-6">Join us and push your limits</p>
                    <div className="flex flex-col gap-4">
                        <button className="flex items-center justify-center gap-3 w-48 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">
                            <FaGoogle className="text-xl" /> Google
                        </button>
                    </div>
                </div>
                {/* Right Panel */}
                <div className="flex-1 bg-black/85 p-8 rounded-r-lg flex flex-col justify-center">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <h3 className="text-2xl font-bold text-center mb-4">Sign Up</h3>
                        {error.api && <p className="text-red-500 text-sm">{error.api}</p>}
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input type="email" placeholder="email@domain.com" value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                            {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Username</label>
                            <input type="text" placeholder="Enter your name" value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                   className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                            {error.username && <p className="text-red-500 text-sm">{error.username}</p>}
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input type="password" placeholder="Enter password" value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                            {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Confirm Password</label>
                            <input type="password" placeholder="Confirm password" value={confirmPassword}
                                   onChange={(e) => setConfirmPassword(e.target.value)}
                                   className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                            {error.confirmPassword && <p className="text-red-500 text-sm">{error.confirmPassword}</p>}
                        </div>
                        <button type="submit"
                                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                                disabled={isLoading}
                        >
                            {isLoading ? "Registering..." : "Sign Up →"}
                        </button>
                        <p className="text-center text-sm mt-2">Already have an account? <a href="/login" className="text-blue-400 underline">Login</a></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
