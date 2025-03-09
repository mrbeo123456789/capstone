import React, { useState } from "react";

const OTPPage = () => {
    const [otp, setOtp] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Entered OTP:", otp);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h2 className="text-2xl font-semibold mb-4">Enter OTP</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="border p-2 rounded text-center text-xl tracking-wide"
                    placeholder="Enter OTP"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Verify
                </button>
            </form>
        </div>
    );
};

export default OTPPage;
