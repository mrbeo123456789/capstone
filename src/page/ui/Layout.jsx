import {Outlet} from "react-router-dom";
import {Header} from "./Header.jsx";
import {Footer} from "./Footer.jsx";
import {SideBar} from "./SideBar.jsx";
import { PaginationProvider } from "../../context/PageContext.jsx";
import { SearchProvider } from "../../context/SearchContext.jsx"

function Layout(){
    return (
        <>
            <SearchProvider>
            <PaginationProvider>
                <div class="flex items-start justify-between">
                    <SideBar/>
                    <div class="flex flex-col w-full pl-0 md:p-4 md:space-y-4">
                        <Header/>
                        <Outlet></Outlet>
                    </div>

                </div>

                <Footer/>
            </PaginationProvider>
            </SearchProvider>
        </>

    )
}

export default Layout;