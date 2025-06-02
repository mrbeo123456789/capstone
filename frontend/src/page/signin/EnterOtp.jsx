import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaLock, FaRedo } from "react-icons/fa";
import {
    useSendOtpToVerifyAccountMutation,
    useVerifyAccountMutation
} from "../../service/authService.js";

const EnterOTP = () => {
    const navigate = useNavigate();
    const email = sessionStorage.getItem("otpEmail") || "";
    const type = sessionStorage.getItem("otpType") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef([]);
    const intervalRef = useRef(null);
    const [resendTimer, setResendTimer] = useState(60);

    const [sendOtpToVerifyAccount, { isLoading: isSending }] = useSendOtpToVerifyAccountMutation();
    const [verifyAccount, { isLoading: isVerifying }] = useVerifyAccountMutation();
    const hasAttempted = useRef(false);

    // Tự động xử lý gửi hoặc khởi động timer một lần duy nhất
    useEffect(() => {
        if (!email || !type || hasAttempted.current) return;
        hasAttempted.current = true;

        if (type === "forgot") {
            // Forgot flow: OTP đã gửi ở trang trước, chỉ chạy timer
            startResendTimer();
            return;
        }

        // Register flow: gửi lần đầu
        sendOtpToVerifyAccount(email)
            .unwrap()
            .then(() => {
                toast.success("OTP đã được gửi đến email.");
                startResendTimer();
            })
            .catch((err) => {
                console.error("❌ OTP gửi thất bại:", err);
                toast.error(err?.data?.message || "Gửi OTP thất bại.");
            });

        return () => clearInterval(intervalRef.current);
    }, []);

    // Cleanup khi unmount
    useEffect(() => () => clearInterval(intervalRef.current), []);

    const startResendTimer = () => {
        setResendTimer(60);
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleChange = (idx, val) => {
        if (/^\d?$/.test(val)) {
            const next = [...otp];
            next[idx] = val;
            setOtp(next);
            if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) {
            toast.error("Vui lòng nhập đủ 6 chữ số OTP.");
            return;
        }

        try {
            await verifyAccount({ email, otp: code }).unwrap();
            toast.success("Xác thực OTP thành công!");

            // Dọn dẹp dữ liệu
            sessionStorage.removeItem("otpEmail");
            sessionStorage.removeItem("otpType");

            setTimeout(() => {
                if (type === "forgot") {
                    navigate("/reset-password", { state: { email } });
                } else {
                    navigate("/login");
                }
            }, 1200);
        } catch (err) {
            const errorMsg = err?.data?.message || err?.data?.error || "OTP không hợp lệ hoặc đã hết hạn.";
            toast.error(errorMsg);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || isSending) return;

        try {
            await sendOtpToVerifyAccount(email).unwrap();
            toast.success("OTP đã được gửi lại.");
            startResendTimer();
        } catch (err) {
            toast.error(err?.data?.error || err?.data?.message || "Gửi lại OTP thất bại.");
        }
    };

    return (
        <div className="relative min-h-screen bg-black">
            {/* Background giữ nguyên */}
            <div
                className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50 z-0"
                style={{
                    backgroundImage:
                        "url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd)",
                }}
            />

            {/* Logo giữ nguyên */}
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

            {/* Form nhập OTP */}
            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Xác minh OTP</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputsRef.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className="w-12 h-12 border-2 rounded-lg text-xl text-center focus:ring-2 focus:ring-red-500"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                        >
                            {isVerifying ? "Đang xác minh..." : "Xác nhận"}
                        </button>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Không nhận được mã?</span>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendTimer > 0 || isSending}
                                className="flex items-center gap-1 text-red-500 hover:underline"
                            >
                                <FaRedo />
                                {resendTimer > 0 ? `Gửi lại (${resendTimer}s)` : "Gửi lại"}
                            </button>
                        </div>

                        <div className="text-center mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    sessionStorage.removeItem("otpEmail");
                                    sessionStorage.removeItem("otpType");
                                    navigate("/login");
                                }}
                                className="text-red-500 hover:underline"
                            >
                                Quay về trang đăng nhập
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EnterOTP;
