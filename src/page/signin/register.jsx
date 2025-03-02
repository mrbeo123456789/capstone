import  { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useRegisterMutation } from "../../service/authService.js";
import { useNavigate } from "react-router-dom"; // Điều hướng sau khi đăng ký

const RegisterForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState({});
    const [successMessage] = useState("");
    const [register, { isLoading }] = useRegisterMutation();
    const navigate = useNavigate(); // Hook điều hướng

    // Kiểm tra định dạng email hợp lệ
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Kiểm tra mật khẩu mạnh: Ít nhất 6 ký tự, có chữ hoa, chữ thường và số
    const validatePassword = (password) => {
        return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/.test(password);
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
            errors.password = "Password must be at least 6 characters, contain an uppercase letter, a lowercase letter, and a number.";
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        setError(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError({});

        if (!validateForm()) return;

        const requestData = { email, username, password };

        console.log("Sending register request:", requestData);

        try {
            const response = await register(requestData).unwrap(); // ✅ Ensure we get the actual response
            console.log("Register response:", response);

            // ✅ Extract and display the correct message
            alert( "Registration successful!");

            navigate("/login");
        } catch (err) {
            console.error("Register error:", err);

            // ✅ Handle the error properly
            setError({ api: err?.data?.message || "Registration failed. Please try again." });
        }
    };


    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

                {/* Thông báo lỗi từ API */}
                {error.api && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm mb-4">
                        {error.api}
                    </div>
                )}

                {/* Thông báo thành công */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm mb-4">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="email@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        {error.username && <p className="text-red-500 text-sm">{error.username}</p>}
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        {error.confirmPassword && <p className="text-red-500 text-sm">{error.confirmPassword}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Sign Up"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button className="bg-red-600 text-white p-2 rounded hover:bg-red-700 flex items-center justify-center w-full">
                        <FaGoogle className="mr-2" /> Sign Up with Google
                    </button>
                </div>

                <p className="text-center text-sm mt-4">
                    Already have an account? <a href="/login" className="text-blue-500">Login</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
