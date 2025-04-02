import {RouterProvider} from "react-router-dom";
import router from './router/router.jsx';
import {SidebarProvider} from "./context/SidebarContext.jsx";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <SidebarProvider>
                <RouterProvider router={router}>
                </RouterProvider>
            </SidebarProvider>
        </>
    )
}
export default App;