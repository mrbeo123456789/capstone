import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast from react-toastify
import { useResetPasswordMutation } from "../../service/authService.js";

const ResetPassword = () => {
    const location = useLocation();
    const email = location.state?.email || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    // ✅ Kiểm tra nếu mất email
    useEffect(() => {
        if (!email) {
            toast.error("Thiếu thông tin email. Vui lòng thực hiện lại.");
            navigate("/forgotPassword");
        }
    }, [email, navigate]);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Vui lòng nhập mật khẩu mới.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            const response = await resetPassword({ email, newPassword: password }).unwrap();
            toast.success(response.message || "Đổi mật khẩu thành công!");

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            const errorMessage =
                error?.data?.message || error?.message || "Đổi mật khẩu thất bại!";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="relative min-h-screen bg-black">
            <div
                className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50"
                style={{
                    backgroundImage:
                        "url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd)",
                }}
            />

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

            <div className="w-full h-screen flex items-center justify-center relative z-10">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <h2 className="text-2xl font-bold text-center text-red-600">Reset Password</h2>
                    <p className="text-gray-600 text-sm text-center mb-4">Nhập mật khẩu mới bên dưới</p>

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Xác nhận"}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-red-500 hover:underline"
                        >
                            Quay về trang đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
