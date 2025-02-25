import {createContext} from "react";


const AuthContext = createContext();

export default function AuthContextProvider (){

    const isAuthenticated = false;


    return <AuthContext.Provider value={isAuthenticated}>

    </AuthContext.Provider>
}