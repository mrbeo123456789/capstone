import React from "react";

const MemberTable = ({ users }) => {
    return (
        <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-orange-500 text-white">
            <tr>
                <th className="border border-gray-300 p-2">#</th>
                <th className="border border-gray-300 p-2">Avatar</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Join Date</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-yellow-200 transition">
                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2 text-center">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mx-auto" />
                    </td>
                    <td className="border border-gray-300 p-2">{user.name}</td>
                    <td className="border border-gray-300 p-2">{user.email}</td>
                    <td className="border border-gray-300 p-2">dd/mm/yyyy</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default MemberTable;
