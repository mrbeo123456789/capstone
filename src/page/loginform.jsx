import React, { useState } from "react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [agree, setAgree] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            newErrors.email = "Invalid email format";
        }
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (!agree) {
            newErrors.agree = "You must agree to the terms";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Form Submitted", { email, username, password, agree });
        }
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
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <h3 className="text-2xl font-bold text-center mb-4">Sign up</h3>
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input type="text" placeholder="email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                   className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                            {errors.email && <span className="text-red-400 text-sm">{errors.email}</span>}
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Username</label>
                            <input type="text" placeholder="Enter your name" value={username} onChange={(e) => setUsername(e.target.value)}
                                   className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white outline-none placeholder-gray-400 focus:border-blue-400" />
                            {errors.password && <span className="text-red-400 text-sm">{errors.password}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} className="w-4 h-4" />
                            <label className="text-sm">I agree to all statements in <a href="#" className="text-blue-400 underline">Terms of service</a></label>
                            {errors.agree && <span className="text-red-400 text-sm">{errors.agree}</span>}
                        </div>
                        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
                            Sign up →
                        </button>
                        <p className="text-center text-sm mt-2">Have an account? <a href="#" className="text-blue-400 underline">Login</a></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
