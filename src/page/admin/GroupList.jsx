import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Check, Search } from 'lucide-react';
import Sidebar from "../navbar/AdminNavbar.jsx";

// Mock data - in a real application, this would come from an API
const initialGroups = [
    { id: 1, name: 'Marketing Team', members: 12, createdAt: '2024-01-15', isBanned: false },
    { id: 2, name: 'Engineering Department', members: 45, createdAt: '2023-11-20', isBanned: true },
    { id: 3, name: 'Sales Division', members: 22, createdAt: '2024-02-10', isBanned: false }
];

const GroupList = () => {
    const [groups, setGroups] = useState(initialGroups);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleToggleBan = (id) => {
        setGroups(groups.map(group =>
            group.id === id
                ? { ...group, isBanned: !group.isBanned }
                : group
        ));
    };

    // Filter groups based on search term
    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-red-50 min-h-screen flex">
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
            </div>
            <div className="flex-1 p-6 overflow-auto">
                <div className="bg-white rounded-lg shadow-md p-6 w-full">
                    <h1 className="text-3xl font-bold text-orange-700 mb-6">Group Management</h1>

                    {/* Search Input Section */}
                    <div className="relative flex mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search groups..."
                            className="flex-grow px-4 py-2 pl-10 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400"
                            size={20}
                        />
                    </div>

                    {/* Group List */}
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white border border-orange-200">
                            <thead>
                            <tr className="bg-orange-100 text-orange-800">
                                <th className="py-3 px-4 text-left">Group Name</th>
                                <th className="py-3 px-4 text-center">Members</th>
                                <th className="py-3 px-4 text-center">Created Date</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredGroups.map((group) => (
                                <tr
                                    key={group.id}
                                    className={`border-b border-orange-100 hover:bg-orange-50 ${group.isBanned ? 'opacity-60' : ''}`}
                                >
                                    <td className="py-3 px-4">
                                        <Link
                                            to={`/groups/${group.id}`}
                                            className="text-orange-600 hover:text-orange-800 hover:underline"
                                        >
                                            {group.name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-center">{group.members}</td>
                                    <td className="py-3 px-4 text-center">{group.createdAt}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${
                                                group.isBanned
                                                    ? 'bg-red-200 text-red-800'
                                                    : 'bg-green-200 text-green-800'
                                            }`}
                                        >
                                            {group.isBanned ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => handleToggleBan(group.id)}
                                            className={group.isBanned
                                                ? "text-green-600 hover:text-green-800"
                                                : "text-red-600 hover:text-red-800"
                                            }
                                        >
                                            {group.isBanned ? <Check size={20} /> : <Ban size={20} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* No results message */}
                        {filteredGroups.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No groups found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupList;