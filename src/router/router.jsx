import {createBrowserRouter} from "react-router-dom";
import LoginForm from "../page/signin/loginform.jsx";
import ErrorPage from "../page/error/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import RegisterForm from "../page/signin/register.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";
import GroupManagement from "../page/group/groupList.jsx";
import AuthCallBack from "../page/signin/AuthCallBack.jsx";
import CreateChallenge from "../page/challenge/CreateChallenge.jsx";
import LoginPage from "../page/signin/LoginPage.jsx";

const router = createBrowserRouter([
    {
        path:"/login",
        errorElement:<ErrorPage/>,
        element: <LoginForm/>,
    },{
        path:"/signin",
        errorElement:<ErrorPage/>,
        element: <LoginPage/>,
    },

    {
        path:"/register",
        errorElement:<ErrorPage/>,
        element: <RegisterForm/>,
    },
    {
        path:"/auth/callback",
        errorElement:<ErrorPage/>,
        element: <AuthCallBack/>,
    },
    {
        path:"/group-management",
        errorElement:<ErrorPage/>,
        element: <GroupManagement/>,
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
    },
    {
        path:"/challenges",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                path:"/challenges/create",
                element: <CreateChallenge />
            }
        ]
    }
]);

export default  router;