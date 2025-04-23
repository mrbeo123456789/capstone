import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../service/authService.js";
import { useGetMyProfileQuery } from "../../service/memberService.js";
import google_icon from "../../assets/google-icon.png";
import { toast } from "react-toastify";
import { decode } from "jsonwebtoken-esm";
import { useTranslation } from "react-i18next"; // Import hook dịch

export default function Login() {
    const { t } = useTranslation(); // Sử dụng hook dịch
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tokenReady, setTokenReady] = useState(false);

    const [login] = useLoginMutation();
    const { data: userData } = useGetMyProfileQuery(undefined, { skip: !tokenReady });
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            console.log("✅ Got user profile:", userData);

            if (userData.avatar) {
                localStorage.setItem("avatar", userData.avatar);
            }
            if (userData.fullName) {
                localStorage.setItem("fullName", userData.fullName);
            }
        }
    }, [userData, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username.trim()) {
            setError(t("auth.login.errors.emptyUsername"));
            return;
        }
        if (password.length < 6) {
            setError(t("auth.login.errors.shortPassword"));
            return;
        }

        setLoading(true);
        try {
            const response = await login({ username, password }).unwrap();
            console.log("Login Response:", response);

            if (response.token) {
                const token = response.token;
                const decoded = decode(token);

                if (decoded && decoded.roles) {
                    const role = Array.isArray(decoded.roles)
                        ? decoded.roles[0]
                        : decoded.roles;

                    console.log("Decoded role:", role);

                    setTokenReady(true);

                    toast.success(t("profileUpdated"), { autoClose: 1500 });

                    setTimeout(() => {
                        if (role.toUpperCase() === "ADMIN") {
                            navigate("/admin/dashboard");
                        } else {
                            navigate("/homepage");
                        }
                    }, 100);
                } else {
                    setError(t("auth.login.errors.invalidToken"));
                }
            } else {
                setError(t("auth.login.errors.unexpectedResponse"));
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err?.data?.error) {
                setError(err.data.error);
            } else if (err.status === 401) {
                setError(t("auth.login.errors.incorrectCredentials"));
            } else {
                setError(t("auth.login.errors.loginFailed"));
            }
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    const handleForgotPassword = () => navigate("/forgotPassword");
    const handleRegister = () => navigate("/register");

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background */}
            <div style={{ backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd)` }} className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50">

            </div>

            {/* Logo */}
            <div className="absolute top-5 left-5 flex items-end">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                    alt="GoBeyond Logo"
                    className="h-10 rounded-full"
                />
                <div className="flex mt-2">
                    <div className="text-4xl font-bold text-white">Go</div>
                    <div className="text-4xl font-bold text-yellow-400">Beyond</div>
                </div>
            </div>

            {/* Login Form */}
            <div className="relative flex items-center justify-center h-screen">
                <div className="w-full max-w-md bg-black bg-opacity-80 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-white text-center mb-6">{t("auth.login.title")}</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Username */}
                        <input
                            type="text"
                            placeholder={t("auth.login.username")}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        {/* Password */}
                        <input
                            type="password"
                            placeholder={t("auth.login.password")}
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
                            {loading ? t("auth.login.loggingIn") : t("auth.login.loginButton")}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center justify-center my-4">
                            <div className="w-1/3 border-b border-gray-500"></div>
                            <span className="mx-2 text-gray-400 text-sm">{t("auth.login.or")}</span>
                            <div className="w-1/3 border-b border-gray-500"></div>
                        </div>

                        {/* Google Login */}
                        <button
                            type="button"
                            onClick={loginWithGoogle}
                            className="w-full flex items-center justify-center bg-white text-black font-medium py-3 rounded-md border border-gray-400 hover:bg-gray-100 transition"
                        >
                            <img src={google_icon} alt="Google" className="h-5 w-5 mr-2" />
                            {t("auth.login.googleLogin")}
                        </button>

                        {/* Forgot Password */}
                        <div className="text-right mt-4">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                {t("auth.login.forgotPassword")}
                            </button>
                        </div>

                        {/* Register */}
                        <div className="text-center text-gray-400 text-sm">
                            <p>
                                {t("auth.login.newUser")}{" "}
                                <button onClick={handleRegister} className="text-white hover:underline">
                                    {t("auth.login.registerNow")}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}