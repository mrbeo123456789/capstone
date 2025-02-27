import {createBrowserRouter} from "react-router-dom";
import LoginForm from "../page/signin/loginform.jsx";
import ErrorPage from "../page/error/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import RegisterForm from "../page/signin/register.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";

const router = createBrowserRouter([
    {
        path:"/login",
        errorElement:<ErrorPage/>,
        element: <LoginForm/>,
    },
    {
        path:"/register",
        errorElement:<ErrorPage/>,
        element: <RegisterForm/>,
    },
    {
        path:"/member",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                path:"/member/detail",
                element: <MemberProfile />
            }
        ]
    }
]);

export default  router;