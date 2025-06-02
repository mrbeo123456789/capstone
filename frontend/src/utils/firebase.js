import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCzpQj91dSFWINYk16aUIEUh72XPoWvicY",
    authDomain: "bookstore-f9ac2.firebaseapp.com",
    projectId: "bookstore-f9ac2",
    storageBucket: "bookstore-f9ac2.appspot.com",
    messagingSenderId: "825577879606",
    appId: "1:825577879606:web:dd2c4eeb3a2c3a93ac0097",
    measurementId: "G-3GFWVD1K4K"
};

// Init Firebase App
const app = initializeApp(firebaseConfig);

// Init Firestore
const db = getFirestore(app);


export { db };
