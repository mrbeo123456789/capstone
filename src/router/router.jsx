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
import CreateChallenge from "../page/admin/detailmodal/CreateChallenge.jsx";
import Settings from "../page/admin/list/Settings.jsx";
import Leaderboard from "../page/ui/Leaderboard.jsx";
import ChallengeEdit from "../page/challenge/ChallengeEdit.jsx";
import ChallengeStatistics from "../page/admin/detailmodal/challengeStatistic.jsx";
import News from "../page/ui/News.jsx"
const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/homepage" /> },
    { path: "*", element: <NotFoundPage /> },
    { path: "create", element: <ChallengeForm /> },
    // Public layout for non-authenticated pages
    {
        path: "/",
        element: <Layout />, // ✅ Layout wraps all main pages
        children: [
            { path: "homepage", element: <HomePage/> },
            { path: "aboutus", element: <AboutUsPage /> },
            { path: "news", element: <News /> },
            { path: "profile", element: <MemberRoute><MemberProfile /></MemberRoute> },
            { path: "statistics", element: <MemberRoute><Statistics /></MemberRoute> },
            { path: "achievement", element: <MemberRoute><Achievement /></MemberRoute> },
            { path: "password", element: <MemberRoute><ChangePassword /></MemberRoute> },
            { path: "ranking", element: <MemberRoute><Leaderboard/></MemberRoute>},
            { path: "challenges/detail/:id", element: <ChallengeDetail /> },
            { path: "challenges", element: <ChallengePage /> },
            {
                path: "challenges",
                element: <MemberRoute><Outlet /></MemberRoute>,
                children: [
                    { path: "joins", element: <YourChallenge /> },
                    { path: "create", element: <ChallengeForm /> },
                    { path: "joins/detail/:id", element: <JoinedChallengeDetail /> },
                    { path: "edit/:id", element: <ChallengeEdit/>}
                ]
            },
            {
                path: "groups",
                element: <MemberRoute><Outlet /></MemberRoute>,
                children: [
                    { path: "create", element: <GroupForm /> },     // Tạo mới nhóm
                    { path: "joins", element: <YourGroup /> },      // Danh sách nhóm đã tham gia
                    { path: "joins/:id", element: <GroupUsers /> }, // Chi tiết nhóm đã tham gia
                    { path: ":id/edit", element: <GroupForm /> }
                ]
            }
        ]
    },


    // Standalone auth pages (outside layout)
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterForm /> },
    { path: "/forgotPassword", element: <ForgotPassword /> },
    { path: "/enter-otp", element: <EnterOTP /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/auth/callback", element: <AuthCallBack /> },

    // Admin-only layout
    {
        path: "/admin",
        element: <AdminRoute><Outlet /></AdminRoute>,
        children: [
            { path: "dashboard", element: <AdminDashboard /> },
            { path: "usermanagement", element: <UserList /> },
            { path: "evidencemanagement", element: <ChallengeEvidencePage /> },
            {path: "settings", element: <Settings /> },
            {
                path: "reports/*",
                element: <ReportList />,
                children: [
                    // { index: true, element: <ReportList /> },
                    { path: ":reportId/detail", element: <ReportDetail /> }
                ]
            },
            { path: "groupmanagement", element: <GroupList /> },
            { path: "challengemanagement", element: <ChallengeList /> },
            { path: "challenge/create", element: <CreateChallenge /> },
            { path: "challenge/statistics", element: <ChallengeStatistics /> },
            { path: "/adminchallenge/:id/detail", element: <AdminChallengeDetail /> }
        ]
    }
]);

export default  router;