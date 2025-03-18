import React from "react";

const VideoModal = ({ show, onClose, videoSrc,onPrevious, onNext, uploader }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg relative sm:grid grid-cols-3 gap-4 h-9/10 w-4/5">
                {/* Video Player */}
                <div className="flex bg-black justify-center col-span-2">
                    {/* Close Button */}
                    <button
                        className="absolute top-2 right-4 text-gray-700 text-2xl"
                        onClick={onClose}>
                        ×
                    </button>
                    <video key={videoSrc} controls className="rounded">
                        <source src={videoSrc} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Side Info */}
                <div className="flex flex-col justify-center items-start p-4">
                    <p className="text-lg font-bold mb-2">Uploaded by:</p>
                    <p className="text-md mb-4">{uploader}</p>
                    <p className="text-sm text-gray-600">Date: dd/mm/yyyy</p>
                    <p className="text-sm text-gray-600">Video src: {videoSrc}</p>
                </div>
            </div>
            {/* Next Video Button */}
            <button
                onClick={onPrevious}
                className="absolute left-4 px-4 py-2 rounded-lg">
                <div aria-label="Nhóm tiếp theo"
                     role="button"
                     tabIndex={0}
                     className="flex items-center justify-center relative h-12 w-12 rounded-full cursor-pointer select-none list-none no-underline outline-none text-inherit bg-white">
                    {/* SVG icon inside */}
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path
                            d="M14.791 5.207 8 12l6.793 6.793a1 1 0 1 1-1.415 1.414l-7.5-7.5a1 1 0 0 1 0-1.414l7.5-7.5a1 1 0 1 1 1.415 1.414z"></path>
                    </svg>
                </div>
            </button>
            {/* Next Video Button */}
            <button
                onClick={onNext}
                className="absolute right-4 px-4 py-2 rounded-lg">
                <div aria-label="Nhóm tiếp theo"
                     role="button"
                     tabIndex={0}
                     className="flex items-center justify-center relative h-12 w-12 rounded-full cursor-pointer select-none list-none no-underline outline-none text-inherit bg-white">
                    {/* SVG icon inside */}
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path
                            d="M9.209 5.207 16 12l-6.791 6.793a1 1 0 1 0 1.415 1.414l7.5-7.5a1 1 0 0 0 0-1.414l-7.5-7.5a1 1 0 1 0-1.415 1.414z"></path>
                    </svg>
                </div>
            </button>


        </div>
    );
};

export default VideoModal;
