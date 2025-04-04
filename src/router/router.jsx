import {createBrowserRouter, Navigate, Outlet} from "react-router-dom";
import { ProtectRouter, AdminRoute, MemberRoute, AuthenticatedRoute } from "./ProtectRouter";
import NotFoundPage from "../component/NotFoundPage.jsx";
import RegisterForm from "../page/signin/register.jsx";
import LoginPage from "../page/signin/loginPage.jsx";
import AboutUsPage from "../page/ui/AboutUs.jsx";
import HomePage from "../page/ui/HomePage.jsx";
import OTPPage from "../page/ui/Otp.jsx";
import AuthCallBack from "../page/signin/AuthCallBack.jsx";
import {Layout} from "lucide-react";
import ChangePassword from "../page/signin/ChangePassword.jsx";
import ForgotPassword from "../page/signin/ForgotPassword.jsx";
import EnterOTP from "../page/signin/EnterOtp.jsx";
import ResetPassword from "../page/signin/ResetPassword.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";
import ChallengePage from "../page/challenge/ChallengePage.jsx";
import YourChallenge from "../page/challenge/YourChallenge.jsx";
import ChallengeForm from "../page/challenge/ChallengeForm.jsx";
import ChallengeDetail from "../page/challenge/ChallengeDetail.jsx";
import JoinedChallengeDetail from "../page/challenge/JoinedChallengeDetail.jsx";
import GroupForm from "../page/group/GroupForm.jsx";
import YourGroup from "../page/group/YourGroup.jsx";
import GroupUsers from "../page/group/GroupUsers.jsx";
import AdminDashboard from "../page/admin/dashboard/AdminDashboard.jsx";
import UserList from "../page/admin/list/UserList.jsx";
import ReportList from "../page/admin/list/ReportList.jsx";
import ReportDetail from "../page/admin/detailmodal/ReportDetail.jsx";
import AdminGroup from "../page/admin/list/GroupList.jsx";
import ChallengeList from "../page/admin/list/ChallengeList.jsx";
import AdminChallengeDetail from "../page/admin/detailmodal/ChallengeDetail.jsx";
import AdminSettings from "../page/admin/list/Settings.jsx";
// Import các component khác...


const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectRouter>
            {/* Logic trong ProtectRouter sẽ tự động chuyển hướng dựa vào role */}
            <Navigate to="/homepage" replace />
        </ProtectRouter>
    },
    {
        path: "*",
        element: <NotFoundPage />
    },
    // Routes không cần xác thực
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterForm />,
    },
    {
        path: "/aboutus",
        element: <AboutUsPage />,
    },
    {
        path: "/home",
        element: <HomePage />,
    },
    {
        path: "/otp",
        element: <OTPPage />,
    },
    {
        path: "/auth/callback",
        element: <AuthCallBack />,
    },

    // Routes cho mọi người dùng đã đăng nhập
    {
        path: "/homepage",
        element: <AuthenticatedRoute>
            <Layout>
                <HomePage />
            </Layout>
        </AuthenticatedRoute>,
    },
    {
        path: "/password",
        element: <AuthenticatedRoute>
            <Layout>
                <ChangePassword />
            </Layout>
        </AuthenticatedRoute>,
    },
    {
        path: "/forgot-password",
        element: <Layout>
            <ForgotPassword />
        </Layout>,
    },
    {
        path: "/enter-otp",
        element: <Layout>
            <EnterOTP />
        </Layout>,
    },
    {
        path: "/reset-password",
        element: <Layout>
            <ResetPassword />
        </Layout>,
    },

    // Routes cho member
    {
        path: "/profile",
        element: <MemberRoute>
            <Layout>
                <MemberProfile />
            </Layout>
        </MemberRoute>,
    },
    {
        path: "/challenges",
        element: <MemberRoute>
            <Layout>
                <ChallengePage />
            </Layout>
        </MemberRoute>,
        children: [
            {
                index: true,
                element: <ChallengePage />
            },
            {
                path: "joins",
                element: <YourChallenge />
            },
            {
                path: "create",
                element: <ChallengeForm />
            },
            {
                path: "detail/:id",
                element: <ChallengeDetail />
            },
            {
                path: "joins/detail/:id",
                element: <JoinedChallengeDetail />
            }
        ]
    },
    {
        path: "/groups",
        element: <MemberRoute>
            <Layout>
                <Outlet />
            </Layout>
        </MemberRoute>,
        children: [
            {
                path: "create",
                element: <GroupForm />
            },
            {
                path: "joins",
                element: <YourGroup />
            },
            {
                path: "joins/:id",
                element: <GroupUsers />
            }
        ]
    },

    // Routes cho admin
    {
        path: "/admin",
        element: <AdminRoute>
            <Outlet />
        </AdminRoute>,
        children: [
            {
                path: "dashboard",
                element: <AdminDashboard />
            },
            {
                path: "settings",
                element: <AdminSettings />
            },
            {
                path: "userlist",
                element: <UserList />
            },
            {
                path: "reportlist",
                element: <ReportList />
            },
            {
                path: "reportdetail",
                element: <ReportDetail />
            },
            {
                path: "grouplist",
                element: <AdminGroup/>
            },
            {
                path: "challengelist",
                element: <ChallengeList />
            },
            {
                path: "challenge/:id/detail",
                element: <AdminChallengeDetail/>
            }
        ]
    }
]);

export default router;