import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForgotPasswordMutation } from "../../service/authService.js";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [showEmail, setShowEmail] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error(t("forgotPassword.errorEmpty"));
            return;
        }

        try {
            const response = await forgotPassword(email).unwrap();
            toast.success(response.message || t("forgotPassword.success"));
            sessionStorage.setItem("otpEmail", email);
            sessionStorage.setItem("otpType", "forgot");
            navigate("/enter-otp");
        } catch (error) {
            toast.error(error?.data?.message || t("forgotPassword.fail"));
        }
    };

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background */}
            <div
                className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50"
                style={{
                    backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media)`
                }}
            />

            {/* Logo */}
            <div className="absolute top-5 left-5 flex items-end">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media"
                    alt="GoBeyond Logo"
                    className="h-10 rounded-full"
                />
                <div className="flex mt-2">
                    <div className="text-4xl font-bold text-white">Go</div>
                    <div className="text-4xl font-bold text-yellow-400">Beyond</div>
                </div>
            </div>

            {/* Form */}
            <div className="w-full h-screen flex items-center justify-center relative">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <h2 className="text-2xl font-bold text-center text-red-600">
                        {t("forgotPassword.title")}
                    </h2>
                    <p className="text-gray-600 text-sm text-center mb-4">
                        {t("forgotPassword.subtitle")}
                    </p>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                {t("forgotPassword.email")}
                                <span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="email"
                                placeholder={t("forgotPassword.emailPlaceholder")}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? t("forgotPassword.sending")
                                : t("forgotPassword.submit")}
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-red-500 hover:underline"
                        >
                            {t("forgotPassword.back")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
