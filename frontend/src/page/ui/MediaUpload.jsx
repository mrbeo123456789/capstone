import React, { useState, useEffect, useRef } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useModerateVideoMutation, useUploadEvidenceMutation } from "../../service/evidenceService.js";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"; // ✅ thêm i18next

const MediaUpload = ({ date, onClose, challengeId, onUploadSuccess }) => {
    const { t } = useTranslation(); // ✅ hook dịch
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [uploadEvidence, { isLoading: isUploadingEvidence }] = useUploadEvidenceMutation();
    const [moderateVideo, { isLoading: isModerating }] = useModerateVideoMutation();

    const isVideo = selectedFile?.type.startsWith("video");

    useEffect(() => {
        if (!selectedFile) return;
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const captureFrame = (videoElement, timeInSeconds) => {
        return new Promise((resolve, reject) => {
            const onSeeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to capture frame"));
                }, 'image/jpeg', 0.8);
                videoElement.removeEventListener('seeked', onSeeked);
            };

            videoElement.addEventListener('seeked', onSeeked);
            videoElement.currentTime = timeInSeconds;
        });
    };

    const moderateImage = async (imageBlob) => {
        const moderationResult = await moderateVideo(imageBlob).unwrap();

        if (!moderationResult || moderationResult.status !== "success") {
            return { approved: false, reason: t("Moderation.unableToAnalyze") };
        }

        const summary = moderationResult.summary;
        if (summary?.action === "reject") {
            return { approved: false, reason: t("Moderation.rejectedBySummary") };
        }

        return { approved: true };
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error(t("Moderation.fileTooLarge"));
            return;
        }

        try {
            if (isVideo) {
                const videoElement = document.createElement('video');
                videoElement.src = URL.createObjectURL(selectedFile);
                videoElement.crossOrigin = "anonymous";
                videoElement.preload = "metadata";

                await new Promise((resolve) => {
                    videoElement.onloadedmetadata = resolve;
                });

                const duration = videoElement.duration;
                const snapshotTimes = [
                    Math.min(10, duration / 2),
                    Math.min(20, duration - 1)
                ];

                for (let time of snapshotTimes) {
                    const frameBlob = await captureFrame(videoElement, time);
                    const result = await moderateImage(frameBlob);

                    if (!result.approved) {
                        toast.error(
                            <div>
                                <b>{t("Moderation.videoRejected")}</b><br />
                                {result.reason}
                            </div>
                        );
                        return;
                    }
                }
            }

            await uploadEvidence({ file: selectedFile, challengeId }).unwrap();
            toast.success(t("Moderation.uploadSuccess"));
            setSelectedFile(null);
            setPreview(null);
            onClose();
            setTimeout(() => {
                if (onUploadSuccess) onUploadSuccess();
            }, 300);

        } catch (error) {
            console.error("Error during submit:", error);
            toast.error(t("Moderation.errorDuringSubmit"));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-4/6 h-4/6 shadow-lg relative">
                <h2 className="text-xl font-bold mb-4 text-center mt-3">
                    {t("Moderation.submitEvidence")} {date?.toDateString()}
                </h2>

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
                                <span className="font-semibold">{t("Moderation.clickToUpload")}</span> {t("Moderation.orDragDrop")}
                            </p>
                            <p className="text-xs text-gray-500">{t("Moderation.acceptedFormats")}</p>
                        </div>
                    )}

                    {preview && !isVideo && (
                        <div
                            className="w-11/12 h-full absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                            <span className="text-white font-semibold">{t("Moderation.changeFile")}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 me-2.5">
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                        {t("Moderation.changeFile")}
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() => {
                            setSelectedFile(null);
                            setPreview(null);
                            onClose();
                        }}
                    >
                        {t("Moderation.cancel")}
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={!selectedFile || isUploadingEvidence || isModerating}
                    >
                        {isUploadingEvidence || isModerating ? t("Moderation.processing") : t("Moderation.submit")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaUpload;
