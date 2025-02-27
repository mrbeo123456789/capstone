import React, { useState } from "react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useLoginMutation } from "../../service/authService.js"; // Import hàm gọi API

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await login({ email, password });
            alert("Đăng nhập thành công!");
            console.log(response);
            window.location.href = "/dashboard"; // Chuyển hướng sau khi đăng nhập
        } catch (err) {
            setError(err.message || "Đăng nhập thất bại");
        }

        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-cover bg-center" style={{ backgroundImage: "url('/assets/loginBackground.webp')" }}>
            <div className="flex bg-black/40 p-8 rounded-lg text-white w-full max-w-4xl shadow-lg">
                {/* Left Panel */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 bg-black/50 rounded-l-lg">
                    <h1 className="text-4xl font-bold mb-4">GoBe</h1>
                    <p className="text-lg mb-6">Go far and fast with us</p>
                    <div className="flex flex-col gap-4">
                        <button className="flex items-center justify-center gap-3 w-48 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">
                            <FaGoogle className="text-xl" /> Google
                        </button>
                        <button className="flex items-center justify-center gap-3 w-48 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
                            <FaFacebookF className="text-xl" /> Facebook
                        </button>
                    </div>
                </div>
                {/* Right Panel */}
                <div className="flex-1 bg-black/85 p-8 rounded-r-lg flex flex-col justify-center">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <h3 className="text-2xl font-bold text-center mb-4">Login</h3>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input type="text" placeholder="email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                   className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                        </div>
                        <button type="submit"
                                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                                disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login →"}
                        </button>
                        <p className="text-center text-sm mt-2">Don't have an account? <a href="#" className="text-blue-400 underline">Sign up</a></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
