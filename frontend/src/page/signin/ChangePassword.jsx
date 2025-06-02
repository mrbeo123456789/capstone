import { useState } from "react";
import { Link } from "react-router-dom";
import { useChangePasswordMutation } from "../../service/memberService.js";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const ChangePassword = () => {
    const { t } = useTranslation();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [show, setShow] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const [changePassword] = useChangePasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t("changePassword.mismatch"));
            return;
        }

        try {
            const response = await changePassword({ oldPassword, newPassword }).unwrap();
            setMessage(response.message);
            setError(null);
        } catch (err) {
            setError(err.data?.message || t("changePassword.fail"));
        }
    };

    const toggleVisibility = (field) => {
        setShow((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="flex">
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-orange-100">
                    <h2 className="text-3xl font-bold text-orange-700 mb-6 text-center">
                        {t("changePassword.title")}
                    </h2>

                    {message && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Old Password */}
                        <div>
                            <label className="block text-black mb-1">
                                {t("changePassword.old")}<span className="text-red-500"> *</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={show.old ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder={t("changePassword.oldPlaceholder")}
                                    required
                                />
                                {/*<button type="button" onClick={() => toggleVisibility("old")} className="absolute right-3 top-2.5 text-gray-600">*/}
                                {/*    {show.old ? <FaEyeSlash /> : <FaEye />}*/}
                                {/*</button>*/}
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-black mb-1">
                                {t("changePassword.new")}<span className="text-red-500"> *</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={show.new ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder={t("changePassword.newPlaceholder")}
                                    required
                                />
                                {/*<button type="button" onClick={() => toggleVisibility("new")} className="absolute right-3 top-2.5 text-gray-600">*/}
                                {/*    {show.new ? <FaEyeSlash /> : <FaEye />}*/}
                                {/*</button>*/}
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-black mb-1">
                                {t("changePassword.confirm")}<span className="text-red-500"> *</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={show.confirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder={t("changePassword.confirmPlaceholder")}
                                    required
                                />
                                {/*<button type="button" onClick={() => toggleVisibility("confirm")} className="absolute right-3 top-2.5 text-gray-600">*/}
                                {/*    {show.confirm ? <FaEyeSlash /> : <FaEye />}*/}
                                {/*</button>*/}
                            </div>
                        </div>

                        {/* Submit & Forgot */}
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition duration-300"
                            >
                                {t("changePassword.submit")}
                            </button>
                            <Link
                                to="/forgotPassword"
                                className="text-orange-600 hover:underline text-sm"
                            >
                                {t("changePassword.forgot")}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;