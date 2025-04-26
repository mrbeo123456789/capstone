import { useState } from "react";
import { useRegisterMutation } from "../../service/authService.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const RegisterForm = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [register, { isLoading }] = useRegisterMutation();
    const navigate = useNavigate();

    const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@/.test(email);
    const validatePassword = (password) => /^.{6,}$/.test(password);

    const validateForm = () => {
        if (!email) {
            toast.error(t("auth.register.errors.emptyEmail"));
            return false;
        } else if (!validateEmail(email)) {
            toast.error(t("auth.register.errors.invalidEmail"));
            return false;
        }

        if (!username) {
            toast.error(t("auth.register.errors.emptyUsername"));
            return false;
        }

        if (!password) {
            toast.error(t("auth.register.errors.emptyPassword"));
            return false;
        } else if (!validatePassword(password)) {
            toast.error(t("auth.register.errors.shortPassword"));
            return false;
        }

        if (password !== confirmPassword) {
            toast.error(t("auth.register.errors.passwordMismatch"));
            return false;
        }

        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await register({ email, username, password }).unwrap();
            toast.success(t("auth.register.success"));
            sessionStorage.setItem("otpEmail", email);
            sessionStorage.setItem("otpType", "register");
            navigate("/enter-otp");
        } catch (err) {
            toast.error(err?.data?.message || t("auth.register.errors.registerFailed"));
        }
    };

    return (
        <div className="relative min-h-screen bg-black flex items-center justify-center">
            {/* Background image with overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd)",
                }}
            />

            {/* Logo */}
            <div className="absolute top-6 left-6 flex items-center z-10">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                    alt="GoBeyond Logo"
                    className="h-10 w-10 rounded-full"
                />
                <div className="flex items-center ml-2">
                    <div className="text-3xl font-bold text-white">Go</div>
                    <div className="text-3xl font-bold text-yellow-400">Beyond</div>
                </div>
            </div>

            {/* Form Container */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-black bg-opacity-90 p-8 rounded-xl shadow-2xl border border-gray-800">
                    <h2 className="text-2xl font-bold text-center text-white mb-6">
                        {t("auth.register.title")}
                    </h2>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder={t("auth.register.email")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                            />

                            <input
                                type="text"
                                placeholder={t("auth.register.username")}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                            />

                            <input
                                type="password"
                                placeholder={t("auth.register.password")}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                            />

                            <input
                                type="password"
                                placeholder={t("auth.register.confirmPassword")}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 shadow-lg shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t("auth.register.registering") : t("auth.register.registerButton")}
                        </button>
                    </form>

                    {/* Footer text */}
                    <p className="text-center text-gray-400 mt-6">
                        {t("auth.register.haveAccount")}{" "}
                        <a href="/login" className="text-red-500 hover:text-red-400 hover:underline transition duration-200">
                            {t("auth.register.loginNow")}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;