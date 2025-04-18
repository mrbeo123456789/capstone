import { useState } from "react";
import { FiBell } from "react-icons/fi";

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);

    const notifications = [
        { id: 1, message: "You have a new message" },
        { id: 2, message: "Your challenge was approved" },
        { id: 3, message: "New group invitation" }
    ]; // Later you can fetch this from server

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-orange-400 hover:text-white transition"
            >
                <FiBell className="text-xl" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No notifications
                        </div>
                    ) : (
                        <ul className="max-h-60 overflow-y-auto">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    className="px-4 py-2 hover:bg-orange-100 text-gray-700 text-sm border-b last:border-0"
                                >
                                    {notification.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}