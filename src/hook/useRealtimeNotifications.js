// src/hooks/useRealtimeNotifications.js
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase.js";

export const useRealtimeNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!userId) return;

        console.log("📡 Listening for userId =", userId);

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", String(userId)),
            orderBy("createdAt", "desc")
        );
        console.log("📌 Subscribing to userId:", userId);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("📦 Firestore data snapshot:", data);  // 🐞 check realtime kết quả
            setNotifications(data);
        });

        return () => unsubscribe();
    }, [userId]);

    return notifications;
};
