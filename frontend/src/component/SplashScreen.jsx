import React from "react";

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-[9999]">
            {/* Logo or Icon */}
            <img
                src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                alt="GoBeyond"
                className="w-24 h-24 mb-4 animate-bounce"
            />

            {/* Loading Text */}
            <h2 className="text-xl font-bold animate-pulse">Loading...</h2>
        </div>
    );
}
