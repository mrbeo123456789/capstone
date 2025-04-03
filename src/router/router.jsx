import {createBrowserRouter, Navigate} from "react-router-dom";
import ErrorPage from "../component/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import RegisterForm from "../page/signin/register.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";
import AuthCallBack from "../page/signin/AuthCallBack.jsx";
import LoginPage from "../page/signin/LoginPage.jsx";
import OTPPage from "../page/ui/Otp.jsx";
import GroupMember from "../page/group/GroupMember.jsx";
import ChallengeForm from "../page/challenge/ChallengeForm.jsx";
import ChangePassword from "../page/signin/ChangePassword.jsx";
import HomePage from "../page/ui/HomePage.jsx";
import AdminDashboard from "../page/admin/dashboard/AdminDashboard.jsx";
import ForgotPassword from "../page/signin/ForgotPassword.jsx";
import EnterOTP from "../page/signin/EnterOtp.jsx";
import ResetPassword from "../page/signin/ResetPassword.jsx";
import ChallengeList from "../page/admin/list/ChallengeList.jsx";
import ReportList from "../page/admin/list/ReportList.jsx";
import UserList from "../page/admin/list/UserList.jsx";
import ChallengeDetail from "../page/challenge/ChallengeDetail.jsx";
import JoinedChallengeDetail from "../page/challenge/JoinedChallengeDetail.jsx";
import YourChallenge from "../page/challenge/YourChallenge.jsx";
import GroupUsers from "../page/group/GroupUsers.jsx";
import GroupForm from "../page/group/GroupForm.jsx";
import YourGroup from "../page/group/YourGroup.jsx";
import Home from "../heroBanner/Home.jsx";
import ChallengePage from "../page/challenge/ChallengePage.jsx";
import ChallengeEvidencePage from "../page/admin/list/EvidenceList.jsx";
import GroupList from "../page/admin/list/GroupList.jsx";
import AboutUsPage from "../page/ui/AboutUs.jsx";
import AdminChallengeDetail from "../page/admin/detailmodal/ChallengeDetail.jsx"
import NotFoundPage from "../component/NotFoundPage.jsx";
import ReportDetail from "../page/admin/detailmodal/ReportDetail.jsx";
const router = createBrowserRouter([
    {
        path: "/", // ✅ Redirect root to homepage
        element: <Navigate to="/homepage" replace />
    },
    {
        path: "*", // ✅ Redirect root to homepage
        element: <NotFoundPage></NotFoundPage>
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
        path:"/home",
        errorElement:<ErrorPage/>,
        element: <Home/>,
    },
    {
        path:"/login",
        errorElement:<ErrorPage/>,
        element: <LoginPage/>,
    },
    {
        path:"/register",
        errorElement:<ErrorPage/>,
                element: <RegisterForm />  // Replace with your default component
    },
    {
        path:"/aboutus",
        errorElement:<ErrorPage/>,
                element: <AboutUsPage />  // Replace with your default component
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
                path:"/groups/create",
                element: <GroupForm />
            },
            {
                path:"/groups/joins",
                element: <YourGroup />
            },
            {
                path:"/groups/joins/:id",
                element: <GroupUsers />
            }
        ]
    },
    {
        path:"/admin",
        errorElement:<ErrorPage/>,
        children:[
            {
                path:"/admin/dashboard",
                errorElement:<ErrorPage/>,
                element: <AdminDashboard/>,
            },
            {
                path:"/admin/userlist",
                errorElement:<ErrorPage/>,
                element: <UserList/>,
            },
            {
                path:"/admin/evidencelist",
                errorElement:<ErrorPage/>,
                element: <ChallengeEvidencePage/>,
            },
            {
                path:"/admin/reportlist",
                errorElement:<ErrorPage/>,
                element: <ReportList/>,
            },
            {
                path:"/admin/reportdetail",
                errorElement:<ErrorPage/>,
                element: <ReportDetail/>,
            },
            {
                path:"/admin/grouplist",
                errorElement:<ErrorPage/>,
                element: <GroupList/>,
            },
            {
                path:"/admin/challengelist",
                errorElement:<ErrorPage/>,
                element: <ChallengeList/>,
            },
            {
                path:"/admin/challenge/:id/detail",
                errorElement:<ErrorPage/>,
                element: <AdminChallengeDetail/>,
            },
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
        // errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                index: true,  // This sets the default page for /member
                element: <ChallengePage />  // Replace with your default component
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