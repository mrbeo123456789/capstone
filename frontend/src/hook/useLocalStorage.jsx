import { useState, useEffect } from "react";

const useLocalStorage = (key, defaultValue = null) => {
    // Helper function to safely get the value from localStorage
    const getValueFromLocalStorage = () => {
        try {
            const savedValue = localStorage.getItem(key);
            return savedValue ? JSON.parse(savedValue) : defaultValue;
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return defaultValue;
        }
    };

    // State to manage the stored value
    const [storedValue, setStoredValue] = useState(getValueFromLocalStorage);

    // Function to update localStorage and state
    const saveValue = (value) => {
        try {
            if (value !== undefined && value !== null) {
                localStorage.setItem(key, JSON.stringify(value));
                setStoredValue(value);
            } else {
                localStorage.removeItem(key);
                setStoredValue(defaultValue);
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Function to clear the value from localStorage
    const clearValue = () => {
        try {
            localStorage.removeItem(key);
            setStoredValue(defaultValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    };

    // Sync with localStorage if key changes dynamically
    useEffect(() => {
        setStoredValue(getValueFromLocalStorage());
    }, [key]);

    return [storedValue, saveValue, clearValue];
};

export default useLocalStorage;
