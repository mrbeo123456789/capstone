import React, { useState, useEffect, useRef } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useUploadEvidenceMutation } from "../../service/evidenceService.js";
import { toast } from "react-toastify"; // ✅

const MediaUpload = ({ date, onClose, challengeId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [uploadEvidence, { isLoading }] = useUploadEvidenceMutation();

    const isVideo = selectedFile?.type.startsWith("video");

    // Generate preview URL
    useEffect(() => {
        if (!selectedFile) return;

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl); // cleanup
    }, [selectedFile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        // Check if file size exceeds 100MB (100 * 1024 * 1024 bytes)
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error("❌ File của bạn đã quá 100MB, vui lòng chọn file với dung lượng nhỏ hơn");
            return;
        }

        try {
            await uploadEvidence({ file: selectedFile, challengeId }).unwrap();
            toast.success("✅ Nộp bằng chứng thành công!");
            setSelectedFile(null);
            setPreview(null);
            onClose();
            setTimeout(() => {
                window.location.reload(); // ✅ Refresh the page
            }, 300);
        } catch (err) {
            console.error(err);
            const errorMessage =
                err?.data?.message ||
                err?.data?.error ||
                "❌ Đã xảy ra lỗi khi nộp bằng chứng.";
            toast.error(errorMessage);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-4/6 h-4/6 shadow-lg relative">
                <h2 className="text-xl font-bold mb-4 text-center mt-3">
                    Submit Evidence for {date?.toDateString()}
                </h2>

                {/* Upload Preview */}
                <div
                    className="relative group w-full h-4/5 mb-4 cursor-pointer justify-items-center"
                    onClick={() => fileInputRef.current.click()}
                >
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                    />

                    {preview ? (
                        isVideo ? (
                            <video
                                src={preview}
                                controls
                                className="w-11/12 h-full object-contain rounded-lg"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-11/12 h-full object-contain rounded-lg"
                            />
                        )
                    ) : (
                        <div
                            className="w-11/12 h-full flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50"
                        >
                            <IoCloudUploadOutline className="text-2xl" />
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">JPG, PNG, MP4, GIF (max 800x400px)</p>
                        </div>
                    )}

                    {/* Hover Overlay */}
                    {preview && !isVideo && (
                        <div
                            className="w-11/12 h-full justify-self-center absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                            <span className="text-white font-semibold">Change File</span>
                        </div>
                    )}
                </div>

                {/* Submit / Cancel */}
                <div className="flex justify-end space-x-3 me-2.5">
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                        Thay đổi file
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() => {
                            setSelectedFile(null);
                            setPreview(null);
                            onClose();
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={!selectedFile || isLoading}
                    >
                        {isLoading ? "Đang nộp bằng chứng..." : "Gửi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaUpload;