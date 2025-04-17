import {createBrowserRouter, Navigate, Outlet} from "react-router-dom";
import Layout from "../page/ui/Layout.jsx";
import RegisterForm from "../page/signin/register.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";
import AuthCallBack from "../page/signin/AuthCallBack.jsx";
import LoginPage from "../page/signin/LoginPage.jsx";
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
import GroupUsers from "../page/group/JoinedGroupDetail.jsx";
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
import {AdminRoute, MemberRoute} from "./ProtectRouter.jsx";
import Statistics from "../page/member/Statistics.jsx";
import Achievement from "../page/member/Achievement.jsx";

import AdminSettings from "../page/admin/list/Settings.jsx";
import {element} from "prop-types";
const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/homepage" /> },
    { path: "*", element: <NotFoundPage /> },

    // Public Pages
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterForm /> },
    { path: "/aboutus", element: <AboutUsPage /> },
    {
        path: "/forgotPassword",
        element: <ForgotPassword />,
    },
    { path: "/enter-otp", element: <EnterOTP /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/auth/callback", element: <AuthCallBack /> },
    { path: "/home", element: <Home /> },

    // Public Homepage
    {
        path: "/homepage",
        element: <Layout />,
        children: [{ index: true, element: <HomePage /> }]
    },
    {
        path: "/profile",
        element: (
            <MemberRoute>
                <Layout />
            </MemberRoute>
        ),
        children: [{ index: true, element: <MemberProfile /> }]
    },
    {
        path: "/statistics",
        element: (
            <MemberRoute>
                <Layout />
            </MemberRoute>
        ),
        children: [{ index: true, element: <Statistics /> }]
    },
    {
        path: "/achievement",
        element: (
            <MemberRoute>
                <Layout />
            </MemberRoute>
        ),
        children: [{ index: true, element: <Achievement /> }]
    },
    {
        path: "/password",
        element: (
            <MemberRoute>
                <Layout />
            </MemberRoute>
        ),
        children: [{ index: true, element: <ChangePassword /> }]
    },
    {
        path: "/groups",
        element: (
            <MemberRoute>
                <Layout />
            </MemberRoute>
        ),
        children: [
            { path: "/groups/create", element: <GroupForm /> },
            { path: "/groups/joins", element: <YourGroup /> },
            { path: "/groups/joins/:id", element: <GroupUsers /> }
        ]
    },
    {
        path: "/challenges",
        element: (
            <MemberRoute>
                <Layout />
            </MemberRoute>
        ),
        children: [
            { index: true, element: <ChallengePage /> },
            { path: "/challenges/joins", element: <YourChallenge /> },
            { path: "/challenges/create", element: <ChallengeForm /> },
            { path: "/challenges/detail/:id", element: <ChallengeDetail /> },
            { path: "/challenges/joins/detail/:id", element: <JoinedChallengeDetail /> }
        ]
    },

    // Admin-only Pages
    {
        path: "/admin",
        element: (
            <AdminRoute>
                <Outlet />
            </AdminRoute>
        ),
        children: [
            { path: "dashboard", element: <AdminDashboard /> },
            { path: "userlist", element: <UserList /> },
            { path: "evidencelist", element: <ChallengeEvidencePage /> },
            { path: "reports/*", element: <ReportList />, children: [{path: "reports/:reportId/detail",element: <ReportDetail />}] },
            { path: "reportdetail", element: <ReportDetail /> },
            { path: "grouplist", element: <GroupList /> },
            { path: "challengelist", element: <ChallengeList /> },
            { path: "challenge/:id/detail", element: <AdminChallengeDetail /> }
        ]
    },
]);

export default  router;