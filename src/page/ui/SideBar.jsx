const menuItems = [
    { name: "My Challenge", href: "/employees", icon: "user-icon" },
    { name: "Group List", href: "/groups", icon: "user-icon" },
    { name: "Achievement", href: "/candidates", icon: "candidate-icon" },
    { name: "Schedules", href: "/schedules", icon: "calendar-icon" },
    { name: "Time Manage", href: "/time", icon: "time-icon" },
];

export const SideBar = () => {
    const currentPath = window.location.pathname; // Get the current path

    return (
        <div className="relative hidden h-screen my-4 ml-4 shadow-lg lg:block w-80">
            <div className="h-full bg-white rounded-2xl dark:bg-gray-700">
                <div className="flex items-center justify-center pt-6">
                    {/* Logo */}
                    <svg width="35" height="30" viewBox="0 0 256 366" version="1.1" preserveAspectRatio="xMidYMid">
                        <defs>
                            <linearGradient x1="12.5%" y1="85.2%" x2="88.2%" y2="10%" id="linearGradient-1">
                                <stop stopColor="#FF0057" stopOpacity="0.16" offset="0%"></stop>
                                <stop stopColor="#FF0057" offset="86.1%"></stop>
                            </linearGradient>
                        </defs>
                        <g>
                            <path d="M0,60.8 C0,27.2 27.2,0 60.8,0 L117,0 L256,0 L256,86.6 C256,103.4 242.4,117 225.6,117 L145.8,117 C130,117.3 117.2,130.1 117,145.9 L117,335.3 C117,352.1 103.4,365.7 86.6,365.7 L0,365.7 L0,117 L0,60.8 Z" fill="#001B38"></path>
                            <circle fill="url(#linearGradient-1)" cx="147" cy="147" r="79"></circle>
                            <circle fill="url(#linearGradient-1)" opacity="0.5" cx="147" cy="147" r="79"></circle>
                        </g>
                    </svg>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.href}
                            className={`flex items-center justify-start w-full p-4 my-2 font-thin uppercase transition-colors duration-200 ${
                                currentPath === item.href
                                    ? "text-blue-500 border-r-4 border-blue-500 bg-gradient-to-r from-white to-blue-100 dark:from-gray-700 dark:to-gray-800"
                                    : "text-gray-500 hover:text-blue-500"
                            }`}
                        >
                            <span className="text-left">
                                {/* Replace below with corresponding SVGs or an Icon Component */}
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 2048 1792"   xmlns="http://www.w3.org/2000/svg">
                                    <path d={getIconPath(item.icon)}></path>
                                </svg>
                            </span>
                            <span className="mx-4 text-sm font-normal">{item.name}</span>
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    );
};

// Example of a helper function for getting SVG paths
function getIconPath(icon) {
    switch (icon) {
        case "user-icon":
            return "M1024 1131q0-64-9-117.5t-29.5-103-60.5-78-97-28.5q-6 4-30 18t-37.5 21.5-35.5 17.5-43 14.5-42 4.5-42-4.5-43-14.5-35.5-17.5-37.5-21.5-30-18q-57 0-97 28.5t-60.5 78-29.5 103-9 117.5 37 106.5 91 42.5h512q54 0 91-42.5t37-106.5zm-157-520q0-94-66.5-160.5t-160.5-66.5-160.5 66.5-66.5 160.5 66.5 160.5 160.5 66.5 160.5-66.5 66.5-160.5zm925 509v-64q0-14-9-23t-23-9h-576q-14 0-23 9t-9 23v64q0 14 9 23t23 9h576q14 0 23-9t9-23zm0-260v-56q0-15-10.5-25.5t-25.5-10.5h-568q-15 0-25.5 10.5t-10.5 25.5v56q0 15 10.5 25.5t25.5 10.5h568q15 0 25.5-10.5t10.5-25.5zm0-252v-64q0-14-9-23t-23-9h-576q-14 0-23 9t-9 23v64q0 14 9 23t23 9h576q14 0 23-9t9-23zm256-320v1216q0 66-47 113t-113 47h-352v-96q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v96h-768v-96q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v96h-352q-66 0-113-47t-47-113v-1216q0-66 47-113t113-47h1728q66 0 113 47t47 113z"; // Replace with actual path data
        case "product-icon":
            return "M685 483q16 0 27.5-11.5t11.5-27.5-11.5-27.5-27.5-11.5-27 11.5-11 27.5 11 27.5 27 11.5zm422 0q16 0 27-11.5t11-27.5-11-27.5-27-11.5-27.5 11.5-11.5 27.5 11.5 27.5 27.5 11.5zm-812 184q42 0 72 30t30 72v430q0 43-29.5 73t-72.5 30-73-30-30-73v-430q0-42 30-72t73-30zm1060 19v666q0 46-32 78t-77 32h-75v227q0 43-30 73t-73 30-73-30-30-73v-227h-138v227q0 43-30 73t-73 30q-42 0-72-30t-30-73l-1-227h-74q-46 0-78-32t-32-78v-666h918zm-232-405q107 55 171 153.5t64 215.5h-925q0-117 64-215.5t172-153.5l-71-131q-7-13 5-20 13-6 20 6l72 132q95-42 201-42t201 42l72-132q7-12 20-6 12 7 5 20zm477 488v430q0 43-30 73t-73 30q-42 0-72-30t-30-73v-430q0-43 30-72.5t72-29.5q43 0 73 29.5t30 72.5z"; // Replace with actual path data
        default:
            return "M1088 1256v240q0 16-12 28t-28 12h-240q-16 0-28-12t-12-28v-240q0-16 12-28t28-12h240q16 0 28 12t12 28zm316-600q0 54-15.5 101t-35 76.5-55 59.5-57.5 43.5-61 35.5q-41 23-68.5 65t-27.5 67q0 17-12 32.5t-28 15.5h-240q-15 0-25.5-18.5t-10.5-37.5v-45q0-83 65-156.5t143-108.5q59-27 84-56t25-76q0-42-46.5-74t-107.5-32q-65 0-108 29-35 25-107 115-13 16-31 16-12 0-25-8l-164-125q-13-10-15.5-25t5.5-28q160-266 464-266 80 0 161 31t146 83 106 127.5 41 158.5z";
    }
}
