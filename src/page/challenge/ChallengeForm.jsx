import { useState } from "react";

const ChallengeForm = () => {
    const [activeTab, setActiveTab] = useState("description");

    return (
        <div
            className="p-6 flex flex-col items-center h-full w-full"
            style={{
                position: "relative",
                boxSizing: "border-box",
                borderRadius: "1em",
                border: "5px solid transparent",
                zIndex: "1",
            }}
        >
            {/* Outer Gradient Border */}
            <div
                className="h-full w-full relative p-1 rounded-lg shadow-md"
                style={{
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: "-1",
                    margin: "-5px",
                    borderRadius: "inherit",
                    background: "linear-gradient(to right, red, orange)",
                }}
            >
                {/* Inner Content Box */}
                <div
                    className="bg-black flex flex-col w-full rounded-lg shadow-md items-center p-6"
                    style={{ borderRadius: "1em" }}
                >
                    {/* Form Section */}
                    <div className="w-full max-w-4xl text-white">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-orange-400">Challenge name*</label>
                                <input
                                    type="text"
                                    placeholder="Input your challenge name"
                                    className="bg-gray-800 text-white p-2 rounded-lg"
                                />
                            </div>

                            {/* Upload Image Section */}
                            <div className="flex flex-col items-center">
                                <img
                                    src="https://via.placeholder.com/80"
                                    alt="Challenge"
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <button className="mt-2 bg-red-600 px-3 py-1 rounded text-white">
                                    Upload Image
                                </button>
                            </div>

                            {/* Date Pickers */}
                            <div className="flex flex-col">
                                <label className="text-orange-400">Start time*</label>
                                <input type="date" className="bg-gray-800 text-white p-2 rounded-lg" />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-orange-400">End time*</label>
                                <input type="date" className="bg-gray-800 text-white p-2 rounded-lg" />
                            </div>

                            {/* Select Inputs */}
                            {["Type", "Category", "Participant type", "Verification method"].map(
                                (label) => (
                                    <div key={label} className="flex flex-col">
                                        <label className="text-orange-400">{label}*</label>
                                        <select className="bg-gray-800 text-white p-2 rounded-lg">
                                            <option>ComboBox</option>
                                        </select>
                                    </div>
                                )
                            )}

                            {/* Number of Participants */}
                            <div className="flex flex-col">
                                <label className="text-orange-400">Number of Participants</label>
                                <select className="bg-gray-800 text-white p-2 rounded-lg">
                                    <option>Number</option>
                                </select>
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <div className="flex mt-4 border-b-2 border-gray-600">
                            <button
                                className={`flex-1 p-2 text-center font-bold ${
                                    activeTab === "description"
                                        ? "bg-blue-400 text-white"
                                        : "hover:bg-gray-600 text-gray-300"
                                }`}
                                onClick={() => setActiveTab("description")}
                            >
                                Description
                            </button>
                            <button
                                className={`flex-1 p-2 text-center font-bold ${
                                    activeTab === "rules"
                                        ? "bg-blue-400 text-white"
                                        : "hover:bg-gray-600 text-gray-300"
                                }`}
                                onClick={() => setActiveTab("rules")}
                            >
                                Rules
                            </button>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 bg-gray-800 text-white rounded-lg mt-4 h-24">
                            {activeTab === "description" ? "Description content..." : "Rules content..."}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-6 mt-6">
                            <button className="bg-red-600 px-6 py-2 rounded text-white hover:bg-red-700">
                                Create
                            </button>
                            <button className="bg-gray-500 px-6 py-2 rounded text-white hover:bg-gray-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeForm;
