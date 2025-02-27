import {createBrowserRouter} from "react-router-dom";
import LoginForm from "../page/loginform.jsx";
import ErrorPage from "../page/error/ErrorPage.jsx";
import Layout from "../page/ui/Layout.jsx";
import MemberProfile from "../page/member/MemberProfile.jsx";

const router = createBrowserRouter([
    {
        path:"/login",
        errorElement:<ErrorPage/>,
        element: <LoginForm/>,
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