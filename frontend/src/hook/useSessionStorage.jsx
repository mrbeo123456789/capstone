import {TOKEN_API_COUNTRY} from "../utils/contant.js";
import {useEffect, useState} from "react";

export default function useSessionStorage(key, initialValue=null) {


    const getValueFromSessionStorage = () => {
        try{
            const savedValue = sessionStorage.getItem(key);
            return savedValue ? JSON.parse(savedValue) : initialValue;
        }catch(error){
            console.error(`Error parsing sessionStorage key "${key}":`, error);
            return initialValue;
        }
    }

    const [storedValue, setStoredValue] = useState(getValueFromSessionStorage());

    const saveValue = (value) => {
        try {
            if(value !== undefined && value !== null) {
                sessionStorage.setItem(key, value);
                setStoredValue(value);
            }else {
                clearValue();
            }
        }catch(error){
            console.error(`Error setting sessionStorage key "${key}":`, error);
        }
    }

    const clearValue = () => {
        try {
            sessionStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing sessionStorage key "${key}":`, error);
        }
    };
    useEffect(() => {
        setStoredValue(getValueFromSessionStorage());
    },[key])
    return [storedValue, saveValue, clearValue];
}