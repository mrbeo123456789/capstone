import React from "react";

const Toggle = ({ isOn, onToggle, disabled = false, onLabel = "On", offLabel = "Off" }) => {
    return (
        <div
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 
                ${isOn ? 'bg-green-500' : 'bg-gray-400'} 
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={!disabled ? onToggle : undefined}
        >
            <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 
                    ${isOn ? 'translate-x-6' : ''}`}
            ></div>
            <span className="sr-only">{isOn ? onLabel : offLabel}</span>
        </div>
    );
};

export default Toggle;