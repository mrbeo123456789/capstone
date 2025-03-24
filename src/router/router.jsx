import {createBrowserRouter} from "react-router-dom";
import LoginForm from "../page/signin/loginform.jsx";
import ErrorPage from "../page/error/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import RegisterForm from "../page/signin/register.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";
import GroupManagement from "../page/group/groupList.jsx";
import AuthCallBack from "../page/signin/AuthCallBack.jsx";
import AdminDashboard from "../page/admin/dashboard/AdminDashboard.jsx";
import UserList from "../page/admin/UserList.jsx";
import ChallengeList from "../page/admin/ChallengeList.jsx";
import EvidenceList from "../page/admin/EvidenceList.jsx";
import ReportList from "../page/admin/ReportList.jsx";
import ChallengeEvidencePage from "../page/admin/ChallengeEvidencePage.jsx";
import ChallengeAndEvidence from "../page/admin/dashboard/ChallengeAndEvidence.jsx";
import ChallengeDetail from "../page/admin/ChallengeDetail.jsx";
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
        element: <ChallengeEvidencePage/>,
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
        path:"/challenge/:id",
        errorElement:<ErrorPage/>,
        element: <ChallengeDetail/>,
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