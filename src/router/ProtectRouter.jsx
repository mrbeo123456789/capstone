import useLocalStorage from "../hook/useLocalStorage.jsx";
import {Navigate, useNavigate} from "react-router-dom";

export function ProtectRouter({children}) {
    const [token, setToken] = useLocalStorage("token")
    console.log(token);
    if (!token?.jwt) {
        //return <Navigate to="/login"/>;
    }
    return children;
}