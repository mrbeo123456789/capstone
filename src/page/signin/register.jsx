import { useState } from "react";
import { useRegisterMutation } from "../../service/authService.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"; // Import hook dịch

const RegisterForm = () => {
    const { t } = useTranslation(); // Sử dụng hook dịch
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
        <div className="relative min-h-screen bg-black">
            <div
                className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50 z-0"
                style={{
                    backgroundImage:
                        "url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd)",
                }}
            />

            <div className="absolute top-5 left-5 flex items-end z-10">
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

            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <h2 className="text-2xl font-bold text-center text-red-600 mb-4">{t("auth.register.title")}</h2>
                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder={t("auth.register.email")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            type="text"
                            placeholder={t("auth.register.username")}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            type="password"
                            placeholder={t("auth.register.password")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            type="password"
                            placeholder={t("auth.register.confirmPassword")}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition"
                        >
                            {isLoading ? t("auth.register.registering") : t("auth.register.registerButton")}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 text-sm mt-6">
                        {t("auth.register.haveAccount")}{" "}
                        <a href="/login" className="text-red-500 hover:underline">
                            {t("auth.register.loginNow")}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;