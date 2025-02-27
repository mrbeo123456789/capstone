import {createBrowserRouter} from "react-router-dom";

import LoginForm from "../page/loginform.jsx";


const router = createBrowserRouter([

    {
        path:"/login",
        errorElement:<ErrorPage/>,
        element: <LoginForm />,


    },
]);

export default  router;