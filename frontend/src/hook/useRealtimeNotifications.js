// src/hooks/useRealtimeNotifications.js
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase.js";

export const useRealtimeNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!userId) return;



        const q = query(
            collection(db, "notifications"),
            where("userId", "==", String(userId)),
            orderBy("createdAt", "desc")
        );


        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(data);
        });

        return () => unsubscribe();
    }, [userId]);

    return notifications;
};
