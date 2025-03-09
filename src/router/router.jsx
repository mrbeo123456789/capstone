import {createBrowserRouter, Navigate} from "react-router-dom";
import LoginForm from "../page/signin/loginform.jsx";
import ErrorPage from "../page/error/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import RegisterForm from "../page/signin/register.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";
import GroupManagement from "../page/group/groupList.jsx";
import AuthCallBack from "../page/signin/AuthCallBack.jsx";
import LoginPage from "../page/signin/LoginPage.jsx";
import NotificationEmail from "../page/ui/NotificationEmail.jsx";
import OTPPage from "../page/ui/Otp.jsx";
import GroupMember from "../page/group/GroupMember.jsx";
import ChallengeForm from "../page/challenge/ChallengeForm.jsx";
import ChangePassword from "../page/signin/ChangePassword.jsx";
import HomePage from "../page/ui/HomePage.jsx";

const router = createBrowserRouter([
    {
        path: "/", // ✅ Redirect root to homepage
        element: <Navigate to="/homepage" replace />
    },
    {
        path:"/homepage",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <HomePage />  // Replace with your default component
            }
        ]
    },
    {
        path:"/login",
        errorElement:<ErrorPage/>,
        element: <LoginForm/>,
    },
    {
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
        path:"/password",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <ChangePassword />  // Replace with your default component
            }
        ]
    },
    {
        path:"/otp",
        errorElement:<ErrorPage/>,
        element: <OTPPage/>,
    },
    {
        path:"/auth/callback",
        errorElement:<ErrorPage/>,
        element: <AuthCallBack/>,
    },
    {
        path:"/groups",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                path:"/groups/joins",
                element: <GroupManagement />
            },
            {
                path:"/groups/joins/member",
                element: <GroupMember />
            }
        ]
    },
    {
        path:"/profile",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <MemberProfile />  // Replace with your default component
            }
        ]
    },
    {
        path:"/challenges",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <ChallengeForm />  // Replace with your default component
            },
            {
                path:"/challenges/joins",
                element: <ChallengeForm />
            }
        ]
    }
]);

export default  router;