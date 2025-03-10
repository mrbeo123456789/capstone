import {createBrowserRouter} from "react-router-dom";
import LoginForm from "../page/signin/loginform.jsx";
import ErrorPage from "../page/error/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import RegisterForm from "../page/signin/register.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";
import GroupManagement from "../page/group/groupList.jsx";
import AuthCallBack from "../page/signin/AuthCallBack.jsx";
import AdminDashboard from "../page/admin/AdminDashboard.jsx";
import UserList from "../page/admin/UserList.jsx";
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