import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useVerifyAccountMutation } from "../../service/authService.js";
import { FaLock, FaRedo } from "react-icons/fa";

const EnterOTP = () => {
    const location = useLocation();
    const email = location.state?.email || "";
    const navigate = useNavigate();

    const [verifyAccount, { isLoading }] = useVerifyAccountMutation();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef([]);
    const [resendTimer, setResendTimer] = useState(60);

    const handleChange = (index, value) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) {
                inputsRef.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) {
            toast.error("Please enter the complete OTP.");
            return;
        }

        try {
            const response = await verifyAccount({ email, otp: code }).unwrap();
            toast.success(response.message || "OTP verified successfully!");
            navigate("/reset-password", { state: { email } });
        } catch (error) {
            toast.error(error?.data?.message || "Invalid OTP or expired!");
        }
    };

    const handleResend = () => {
        if (resendTimer > 0) return;
        // 🔁 You should hook this to resend OTP API if available
        toast.success("OTP resent to your email.");
        setResendTimer(60);
    };

    // ⏳ Countdown
    useState(() => {
        const interval = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen bg-black">
            <div
                className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50"
                style={{
                    backgroundImage:
                        "url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd)",
                }}
            ></div>

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

            {/* OTP Card */}
            <div className="w-full h-screen flex items-center justify-center relative">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <div className="flex flex-col items-center mb-4">
                        <FaLock className="text-4xl text-red-600 mb-2" />
                        <h2 className="text-2xl font-bold text-red-600">Enter OTP</h2>
                        <p className="text-gray-600 text-sm text-center">Check your email and enter the code</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex justify-between gap-2">
                            {otp.map((val, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (inputsRef.current[idx] = el)}
                                    type="password"
                                    maxLength={1}
                                    value={val}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-12 border-2 rounded-lg text-xl text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Submit"}
                        </button>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Didn't receive code?</span>
                            <button
                                type="button"
                                className="text-red-500 hover:underline flex items-center gap-1"
                                onClick={handleResend}
                                disabled={resendTimer > 0}
                            >
                                <FaRedo /> Resend ({resendTimer}s)
                            </button>
                        </div>

                        <div className="text-center mt-2">
                            <button
                                type="button"
                                className="text-red-500 hover:underline"
                                onClick={() => navigate("/login")}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EnterOTP;
