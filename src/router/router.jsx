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
import AdminDashboard from "../page/admin/AdminDashboard.jsx";
import ForgotPassword from "../page/signin/ForgotPassword.jsx";
import EnterOTP from "../page/signin/EnterOtp.jsx";
import ResetPassword from "../page/signin/ResetPassword.jsx";
import GroupPage from "../page/group/GroupPage.jsx";
import ChallengeList from "../page/admin/ChallengeList.jsx";
import ReportList from "../page/admin/ReportList.jsx";
import EvidenceList from "../page/admin/EvidenceList.jsx";
import UserList from "../page/admin/UserList.jsx";
import ChallengeDetail from "../page/challenge/ChallengeDetail.jsx";
import JoinedChallengeDetail from "../page/challenge/JoinedChallengeDetail.jsx";
import YourChallenge from "../page/challenge/YourChallenge.jsx";

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
        path:"/admin-dashboard",
        errorElement:<ErrorPage/>,
        element: <AdminDashboard/>,
    },
    {
        path:"/admin-dashboard",
        errorElement:<ErrorPage/>,
        element: <AdminDashboard/>,
    },
    {
        path:"/admin-userlist",
        errorElement:<ErrorPage/>,
        element: <UserList/>,
    },
    {
        path:"/admin-evidencelist",
        errorElement:<ErrorPage/>,
        element: <EvidenceList/>,
    },
    {
        path:"/admin-reportlist",
        errorElement:<ErrorPage/>,
        element: <ReportList/>,
    },
    {
        path:"/admin-challengelist",
        errorElement:<ErrorPage/>,
        element: <ChallengeList/>,
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
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <RegisterForm />  // Replace with your default component
            }
        ]
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
        path:"/forgot-password",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <ForgotPassword />  // Replace with your default component
            }
        ]
    },
    {
        path:"/enter-otp",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <EnterOTP />  // Replace with your default component
            }
        ]
    },
    {
        path:"/reset-password",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <ResetPassword />  // Replace with your default component
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
                element: <GroupPage />
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
                element: <YourChallenge />
            },
            {
                path:"/challenges/create",
                element: <ChallengeForm />
            },
            {
                path:"/challenges/detail/:id",
                element: <ChallengeDetail />
            },
            {
                path: "/challenges/joins/detail/:id",
                element: <JoinedChallengeDetail />
            }
        ]
    }
]);

export default  router;