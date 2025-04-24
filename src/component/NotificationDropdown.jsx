import { useState, useEffect } from "react";
import { useGetNotificationsQuery } from "../service/notficaitionService.js";
import { useRealtimeNotifications } from "../hook/useRealtimeNotifications.js";
import { IoMdNotificationsOutline } from "react-icons/io";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase.js";
import { useTranslation } from "react-i18next";

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const { data: backendResponse, isLoading: isBackendLoading } = useGetNotificationsQuery({ limit: 10 });
    const memberId = backendResponse?.memberId;
    const realtimeData = useRealtimeNotifications(memberId);

    const notifications = realtimeData.length > 0
        ? realtimeData
        : backendResponse?.notifications || [];

    // Debug log tất cả notifications
    useEffect(() => {
        if (isOpen) {
            const unread = notifications.filter(n => !n.isRead);

            unread.forEach(async (n) => {
                try {
                    const docRef = doc(db, "notifications", n.id);
                    await updateDoc(docRef, { isRead: true });
                } catch (err) {
                    console.error("❌ Lỗi khi đánh dấu đã đọc:", err);
                }
            });
        }
    }, [isOpen, notifications]);

    const formatDateTime = (timestamp) => {
        const date = timestamp?.seconds
            ? new Date(timestamp.seconds * 1000)
            : new Date(timestamp);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(date);
    };

    if (isBackendLoading || !memberId) return null;

    return (
        <div className="relative">
            <button className="relative" onClick={() => setIsOpen(prev => !prev)}>
                <IoMdNotificationsOutline className="text-white text-2xl" />
                {notifications.some(n => !n.isRead) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-white shadow-lg rounded-md z-50">
                    {notifications.length > 0 ? (
                        notifications.map((item) => {
                            console.log("🔎 item:", item);
                            console.log("🔑 titleKey:", item.title);
                            console.log("🔑 contentKey:", item.content);
                            console.log("📦 item.data:", item.data);
                            console.log("📦 item.params:", item.params);

                            return (
                                <div
                                    key={item.id}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                                        !item.isRead ? "bg-yellow-50 border-l-4 border-yellow-400" : "bg-white"
                                    }`}
                                >
                                    <strong className="block text-sm font-medium">
                                        {t(item.title, item.params)}
                                    </strong>
                                    <p className="text-xs text-gray-600">
                                        {t(item.content, item.params)}
                                    </p>
                                    {item.createdAt && (
                                        <p className="text-[10px] text-gray-400 mt-1 italic">
                                            {formatDateTime(item.createdAt)}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="p-4 text-gray-500">{t("notification.empty")}</p>
                    )}
                </div>
            )}
        </div>
    );
};
