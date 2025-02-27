import {RouterProvider} from "react-router-dom";
import router from './router/router.jsx';

const App = () => {
    return (
        <>
            <RouterProvider router={router}>
            </RouterProvider>
        </>
    )
}
export default App;