import { useState } from "react";
import {useNavigate} from "react-router-dom";

const GroupsPage = () => {
    const navigate = useNavigate();

    const [invitations, setInvitations] = useState([
        { id: 1, user: "User1", groupName: "Group X", status: "Pending", groupImage: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/z6401921430828_462eb669057b59d555bd03ee167b7c97.jpg?alt=media&token=e54d868b-2854-4850-b43a-8ac95f7ff53d" }
    ]);

    const [yourGroups, setYourGroups] = useState([
        { id: 1, name: "Group A", image: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/z6401921430828_462eb669057b59d555bd03ee167b7c97.jpg?alt=media&token=e54d868b-2854-4850-b43a-8ac95f7ff53d", status: "Joined" }
    ]);

    const [joinedGroups, setJoinedGroups] = useState([
        { id: 1, name: "Group 1", image: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/z6401921430828_462eb669057b59d555bd03ee167b7c97.jpg?alt=media&token=e54d868b-2854-4850-b43a-8ac95f7ff53d", status: "Joined" },
        { id: 2, name: "Group 2", image: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/z6401921430828_462eb669057b59d555bd03ee167b7c97.jpg?alt=media&token=e54d868b-2854-4850-b43a-8ac95f7ff53d", status: "Pending" },
        { id: 3, name: "Group 3", image: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/z6401921430828_462eb669057b59d555bd03ee167b7c97.jpg?alt=media&token=e54d868b-2854-4850-b43a-8ac95f7ff53d", status: "Joined" }
    ]);

    const handleAccept = (id) => {
        const acceptedGroup = invitations.find(invite => invite.id === id);
        setYourGroups([...yourGroups, { ...acceptedGroup, status: "Joined" }]);
        setInvitations(invitations.filter(invite => invite.id !== id));
    };

    const handleDecline = (id) => {
        setInvitations(invitations.filter(invite => invite.id !== id));
    };

    return (
        <div className="bg-gradient-to-r from-red-700 to-orange-600 rounded-lg w-full p-1">
            <div className="bg-white flex flex-col rounded-lg shadow-md p-6 h-full">
                <div className="p-6 flex flex-col items-center w-full">

                    {/* Search & Create Group */}
                    <div className="flex justify-between w-full">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-2/3 p-2 rounded-lg border border-gray-400"
                        />
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            onClick={() => navigate(`/groups/create`)}
                        >
                            Create a new group
                        </button>
                    </div>

                    {/* Invitations */}
                    <div className="w-full">
                        <h2 className="text-orange-400 font-bold">Invitation ({invitations.length})</h2>
                        {invitations.length > 0 && (
                            <div className="mt-4 p-4 rounded-lg shadow-lg w-1/3 bg-orange-50">
                                <p className="text-white">📢 {invitations[0].user} invites you to a group</p>
                                <div className="p-4 mt-2 rounded-lg flex items-center grid grid-cols-2 gap-6">
                                    <div>
                                        <img src={invitations[0].groupImage} alt="Group"
                                             className="w-20 h-20 mt-2 rounded-lg"/>
                                        <p className="text-orange-400 font-bold">{invitations[0].groupName}</p>
                                    </div>
                                    <div className="flex gap-4 flex flex-col items-center">
                                        <button
                                            className="bg-green-600 px-4 py-2 rounded-lg text-white hover:bg-green-700"
                                            onClick={() => handleAccept(invitations[0].id)}>
                                            Accept
                                        </button>
                                        <button
                                            className="bg-gray-600 px-4 py-2 rounded-lg text-white hover:bg-gray-700"
                                            onClick={() => handleDecline(invitations[0].id)}>
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Your Groups */}
                    <div className="mt-6 w-full">
                        <h2 className="text-orange-400 font-bold">Your Groups</h2>
                        <div className="flex gap-4 mt-2">
                            {yourGroups.map(group => (
                                <div key={group.id}
                                     onClick={() => navigate(`/groups/joins/${group.id}`)}
                                     className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                                    <img src={group.image} alt={group.name} className="w-20 h-20 rounded-lg"/>
                                    <p className="text-orange-400 mt-2">{group.name}</p>
                                    <span className={`px-3 py-1 mt-2 text-white text-xs font-bold rounded-lg 
                                        ${group.status === "Joined" ? "bg-green-600" : "bg-gray-600"}`}>
                                        {group.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Joined Groups */}
                    <div>
                        <h2 className="text-orange-400 font-bold">Joined Groups</h2>
                        <div className="mt-6 w-full flex items-center">
                            <div className="flex gap-4 mt-2 overflow-x-auto">
                                {joinedGroups.map(group => (
                                    <div key={group.id} className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                                        <img src={group.image} alt={group.name} className="w-20 h-20 rounded-lg"/>
                                        <p className="text-orange-400 mt-2">{group.name}</p>
                                        <span className={`px-3 py-1 mt-2 text-white text-xs font-bold rounded-lg 
                                            ${group.status === "Joined" ? "bg-green-600" : "bg-gray-600"}`}>
                                            {group.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button className="text-orange-400 text-2xl ml-4">{">"}</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GroupsPage;
