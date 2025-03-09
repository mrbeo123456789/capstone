import React from "react";

const HomePage = () => {
    return (
        <main className="text-white">
            {/* Hero Section */}
            <section className="container mx-auto py-16 px-4 flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/2">
                    <img
                        src="https://source.boringavatars.com/beam/600/GoBeyond?colors=ef4444,f97316,dc2626"
                        alt="runner"
                        className="rounded-lg shadow-lg"
                    />
                </div>
                <div className="lg:w-1/2 text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-orange-500">Are You Ready?</h2>
                    <p className="mt-4 text-lg">
                        Join challenges to discover your potential or push yourself beyond limits.
                    </p>
                    <div className="flex justify-center lg:justify-start gap-4 mt-6">
                        <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center">
                            <i className="fa fa-facebook mr-2"></i>Sign up with Facebook
                        </a>
                        <a href="#" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center">
                            <i className="fa fa-google-plus mr-2"></i>Sign up with Google
                        </a>
                    </div>
                </div>
            </section>

            {/* Ranking Section */}
            <section className="container mx-auto py-16 px-4">
                <h3 className="text-2xl font-bold text-orange-500 text-center">Leaderboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {[1, 2, 3, 4, 5, 6].map((rank) => (
                        <div key={rank} className="bg-gray-900 rounded-lg shadow-lg p-6 flex items-center">
                            <img
                                src={`https://randomuser.me/api/portraits/men/${rank}.jpg`}
                                className="rounded-full border-2 border-orange-500 w-16 h-16"
                                alt="User"
                            />
                            <div className="ml-4">
                                <h4 className="text-lg font-bold">User {rank}</h4>
                                <span className="text-sm">Level: Ultra Trail</span>
                                <div className="mt-2 flex gap-2">
                                    <span className="bg-yellow-500 px-2 py-1 text-xs rounded">⭐ 7000</span>
                                    <span className="bg-blue-500 px-2 py-1 text-xs rounded">⭐ 10 This Month</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-6">
                    <a href="#" className="text-orange-500 font-semibold hover:underline">
                        View All
                    </a>
                </div>
            </section>

            {/* Challenges Section */}
            <section className="container mx-auto py-16 px-4">
                <h3 className="text-2xl font-bold text-orange-500 text-center">Upcoming Challenges</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                            <img
                                src={`https://loremflickr.com/300/200/running,marathon?random=${i}`}
                                className="w-full h-48 object-cover"
                                alt="Challenge"
                            />
                            <div className="p-4">
                                <h4 className="font-bold text-lg">Challenge {i + 1}</h4>
                                <p className="text-sm text-gray-300">Run and achieve new goals!</p>
                                <a href="#" className="text-orange-500 text-sm mt-2 block hover:underline">
                                    Join Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Prizes Section */}
            <section className="container mx-auto py-16 px-4">
                <h3 className="text-2xl font-bold text-orange-500 text-center">Prizes</h3>
                <div className="grid grid-cols-3 gap-6 mt-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                            <img
                                src={`https://loremflickr.com/200/200/trophy,medal?random=${i}`}
                                className="w-24 h-24 mx-auto"
                                alt="Prize"
                            />
                            <h4 className="mt-4 font-bold">Prize {i + 1}</h4>
                            <p className="text-sm text-gray-300">Achieve this by completing challenges!</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How to Join Section */}
            <section className="container mx-auto py-16 px-4">
                <h3 className="text-2xl font-bold text-orange-500 text-center">How to Join</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {["Register", "Participate & Update", "Get Rewards"].map((step, i) => (
                        <div key={i} className="bg-gray-900 rounded-lg shadow-lg p-6 text-center">
                            <img
                                src={`https://loremflickr.com/150/150/fitness,workout?random=${i}`}
                                className="w-24 h-24 mx-auto"
                                alt="Step"
                            />
                            <h4 className="mt-4 font-bold">{step}</h4>
                            <p className="text-sm text-gray-300">
                                {i === 0 && "Create an account and register for challenges."}
                                {i === 1 && "Use tracking apps to log your progress."}
                                {i === 2 && "Get medals and rewards upon completion!"}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Social Media Connect */}
            <section className="container mx-auto py-16 px-4 text-center">
                <h3 className="text-2xl font-bold text-orange-500">Connect with Us</h3>
                <div className="flex justify-center gap-6 mt-6">
                    <a href="#" className="text-gray-300 hover:text-blue-400 text-2xl">
                        <i className="fa fa-facebook"></i>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-pink-400 text-2xl">
                        <i className="fa fa-instagram"></i>
                    </a>
                    <a href="#" className="text-gray-300 hover:text-blue-500 text-2xl">
                        <i className="fa fa-twitter"></i>
                    </a>
                </div>
            </section>
        </main>
    );
};

export default HomePage;
