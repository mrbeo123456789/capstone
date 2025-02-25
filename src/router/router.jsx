import {createBrowserRouter} from "react-router-dom";
import Users from "../page/user/Users.jsx";
import Products from "../page/product/Products.jsx";
import NotFound from "../page/error/NotFound.jsx";
import UserDetail from "../page/user/UserDetail.jsx";
import ErrorPage from "../page/error/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import Login from "../page/ui/Login.jsx";
import ForgotPassword from "../page/ui/Forgot-password.jsx";
import OTP from "../page/ui/OTP.jsx";
import {ProtectRouter} from "./ProtectRouter.jsx";
import Register from "../page/ui/Register.jsx";
import Employees from "../page/employee/Employees.jsx";
import EmployeeDetail from "../page/employee/EmployeeDetail.jsx";
import {lazy} from "react";
import Calendar from "../page/schedule/Schedule.jsx";
import ScheduleAdd from "../page/schedule/ScheduleAdd.jsx";

const EmployeeAddLazy = lazy(() => import("../page/employee/EmployeeAdd.jsx"));

import HomePage from "../page/ui/HomePage.jsx";
import Candidate from "../page/candidate/Candidate.jsx";
import JobDetail from "../page/job/JobDetail.jsx";
import Job from "../page/job/Job.jsx";
import GuestJob from "../page/userjob/GuestJob.jsx";
import GuestJobDetail from "../page/userjob/GuestJobDetail.jsx";
import GuestApply from "../page/userjob/GuestApply.jsx";

const router = createBrowserRouter([
    {
        path:"/employees",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                path:"",
                element: <Employees />,
            },
            {
                path:"/employees/:id",
                element: <EmployeeDetail />,
            },
            {
                path:"/employees/add",
                element: <EmployeeAddLazy/>
            }
        ]
    },
    {
        path:"",
        element: <Layout></Layout>,
        children:[
            {
                path:"/",
                element: <GuestJob></GuestJob>,
            },
        ]

    },
    {
        path:"/guest/jobs/:id",
        element: <GuestJobDetail></GuestJobDetail>,
    },
    {
        path:"/apply/:id",
        element: <GuestApply/>,
    },
    {
        path:"/users",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                path:"",
                element: <Users />,
            },
            {
                path:"/users/:id",
                element: <UserDetail />,
            }
        ]
    },
    {
        path:"/login",
        errorElement:<ErrorPage/>,
        element: <Login />,


    },
    {
        path:"/register",
        errorElement:<ErrorPage/>,
        element: <Register />,


    },
    {
        path:"/forgot-password",
        errorElement:<ErrorPage/>,
        element: <ForgotPassword />,
    },
    {
        path:"/OTP",
        errorElement:<ErrorPage/>,
        element: <OTP/>,
    },
    {
        path: "/candidates",
        errorElement: <ErrorPage />,
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Candidate />,
            },
        ],
    },
    {
        path:"",
        element: <HomePage />,
    },
    {
        path:"/schedules",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                path:"",
                element: <Calendar />,
            },
            {
                path:"/schedules/add",
                element: <ScheduleAdd />,
            }
        ]
    },
    {
        path:"/jobs",
        errorElement:<ErrorPage/>,
        element: <Layout></Layout>,
        children:[
            {
                path:"",
                element: <Job />,
            },
            {
                path:"/jobs/:id",
                element: <JobDetail />,
            }
        ]
    },
]);

export default  router;