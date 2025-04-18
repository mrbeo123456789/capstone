import React from "react";

// eslint-disable-next-line react/prop-types
const Modal = ({ onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                {children}
                <button
                    onClick={onClose}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                </button>
        </div>
    );
};

export default Modal;
