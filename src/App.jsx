import {RouterProvider} from "react-router-dom";
import router from './router/router.jsx';
import {SidebarProvider} from "./context/SidebarContext.jsx";

const App = () => {
    return (
        <>
            <SidebarProvider>
                <RouterProvider router={router}>
                </RouterProvider>
            </SidebarProvider>
        </>
    )
}
export default App;