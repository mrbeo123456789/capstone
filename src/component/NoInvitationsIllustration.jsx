// src/components/NoInvitationsIllustration.jsx
import React from "react";

const NoInvitationsIllustration = ({ themeColor = "#FF5733" }) => {
    return (
        <svg viewBox="0 0 500 400">
            <path d="M150,50 L350,50 L350,350 L150,350 Z" fill="#fff" stroke="#ddd" strokeWidth="3" />
            <path d="M175,80 L325,80 M175,120 L325,120 M175,160 L275,160 M175,200 L250,200"
                  stroke="#eee" strokeWidth="5" strokeLinecap="round" />
            <circle cx="320" cy="230" r="70" fill="#fff" stroke={themeColor} strokeWidth="8" />
            <circle cx="320" cy="230" r="60" fill="none" stroke={themeColor} strokeWidth="3" strokeOpacity="0.5" />
            <line x1="375" y1="280" x2="420" y2="330" stroke={themeColor} strokeWidth="12" strokeLinecap="round" />
            <text x="320" y="260" fontSize="80" textAnchor="middle" fill={themeColor} fontWeight="bold">?</text>
            <circle cx="220" cy="260" r="40" fill="#FFF0E6" stroke={themeColor} strokeWidth="2" strokeOpacity="0.5" />
            <circle cx="205" cy="250" r="4" fill="#666" />
            <circle cx="235" cy="250" r="4" fill="#666" />
            <path d="M200,275 Q220,265 240,275" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
};

export default React.memo(NoInvitationsIllustration);
