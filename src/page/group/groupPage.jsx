import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "../../component/Sidebar.jsx";

const GroupPage = () => {
    const [groups, setGroups] = useState([]);
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/groups")
            .then((res) => res.json())
            .then((data) => setGroups(data));

        fetch("http://localhost:5000/api/invitations")
            .then((res) => res.json())
            .then((data) => setInvitations(data));
    }, []);

    return (
        <Router>
            <div className="flex h-screen text-white bg-gray-900">
                <Sidebar />
                <div className="flex-1 p-5 bg-gray-800">
                    <div className="flex justify-between items-center mb-5">
                        <input type="text" placeholder="https://" className="w-2/3 p-2 rounded bg-gray-700 text-white border border-gray-600" />
                        <button className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded">Create a new group</button>
                    </div>

                    <div className="bg-gray-700 p-5 rounded mb-5">
                        <h3 className="text-lg font-bold mb-3">Invitations ({invitations.length})</h3>
                        {invitations.map((invite) => (
                            <div key={invite.id} className="flex justify-between items-center bg-gray-600 p-4 rounded mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white text-black rounded-full flex justify-center items-center font-bold">
                                        {invite.user[0]}
                                    </div>
                                    <p><strong>{invite.user}</strong> invites you to join <strong>{invite.group}</strong></p>
                                </div>
                                <div className="space-x-2">
                                    <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">Accept</button>
                                    <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-700 p-5 rounded mb-5">
                        <h3 className="text-lg font-bold mb-3">Your groups</h3>
                        {groups.map((group) => (
                            <div key={group.id} className="bg-red-800 p-4 text-center rounded mb-2">{group.name}</div>
                        ))}
                    </div>
                </div>
            </div>
        </Router>
    );
};

export default GroupPage;
