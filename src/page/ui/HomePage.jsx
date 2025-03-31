import React from "react";
import {useGetApprovedChallengesQuery} from "../../service/challengeService.js";
import { useNavigate } from "react-router-dom";
import GameSwiper from "../../heroBanner/GameSwiper.jsx";

const HomePage = () => {
    const { data, isLoading, isError } = useGetApprovedChallengesQuery({ page: 0, size: 5 });
    console.log(data);
    const navigate = useNavigate();

    return (
        <main className="bg-amber-50 text-gray-800">
            <GameSwiper/>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-orange-accent-100 to-orange-accent-700 py-10 px-4 text-white">
                <div className="container mx-auto flex flex-col lg:flex-row items-center">
                    <div className="lg:w-1/2">
                        <img
                            src="https://news.sanfordhealth.org/wp-content/uploads/2017/07/woman-on-yoga-mat.jpg"
                            alt="runner"
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                    <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mt-6 lg:mt-0 lg:pl-16">
                        <h2 className="text-3xl font-bold text-yellow-400">Are You Ready?</h2>
                        <p className="mt-4 text-lg">
                            Join challenges to discover your potential or push yourself beyond limits.
                        </p>
                        <div className="flex justify-center lg:justify-start gap-4 mt-6">
                            <a href="#" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold px-6 py-3 rounded-md flex items-center transition">
                                <i className="fa fa-facebook mr-2"></i>Sign up with Facebook
                            </a>
                            <a href="#" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md flex items-center transition">
                                <i className="fa fa-google-plus mr-2"></i>Sign up with Google
                            </a>
                        </div>
                    </div>
                </div>
            </section>






            {/* Ranking Section */}
            <section className="py-12 px-4 bg-amber-50">
                <div className="container mx-auto">
                    <h3 className="text-2xl font-bold text-red-500 text-center mb-8">Leaderboard</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((rank) => (
                            <div key={rank} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-gray-200 hover:shadow-lg transition">
                                <img
                                    src={`https://randomuser.me/api/portraits/men/${rank}.jpg`}
                                    className="rounded-full border-2 border-yellow-400 w-16 h-16"
                                    alt="User"
                                />
                                <div className="mt-3">
                                    <h4 className="text-lg font-bold">User {rank}</h4>
                                    <span className="text-sm text-gray-600">Level: Ultra Trail</span>
                                    <div className="mt-2 flex flex-col gap-1">
                                        <span className="bg-yellow-400 text-gray-800 px-2 py-1 text-xs rounded-full font-bold">⭐ 7000</span>
                                        <span className="bg-orange-300 text-white px-2 py-1 text-xs rounded-full font-bold">⭐ 10 This Month</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <a href="#" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-8 rounded-md transition inline-block">
                            View All
                        </a>
                    </div>
                </div>
            </section>

            {/* Challenges Section */}
            <section className="py-12 px-4 bg-orange-400">
                <div className="container mx-auto">
                    <h3 className="text-2xl font-bold text-orange-100 text-center mb-8">Upcoming Challenges</h3>

                    {isLoading && <p className="text-center">Loading challenges...</p>}
                    {isError && <p className="text-center text-red-500">Failed to load challenges.</p>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data?.content?.map((challenge) => (
                            <div
                                key={challenge.id}
                                onClick={() => navigate(`/challenges/detail/${challenge.id}`)}
                                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-gray-200"
                            >
                                <img
                                    src={challenge.picture
                                        ? challenge.picture
                                        : `https://loremflickr.com/300/200/running,marathon?random=${challenge.id}`}
                                    className="w-full h-48 object-cover"
                                    alt="Challenge"
                                />
                                <div className="p-4">
                                    <h4 className="font-bold text-lg text-gray-800">{challenge.name}</h4>
                                    <p className="text-sm text-gray-600">{challenge.summary || "Join and push your limits!"}</p>
                                    <span className="text-orange-100 text-sm mt-2 block hover:underline font-medium">
                                      View Details
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <a href="#" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-8 rounded-md transition inline-block">
                            View All
                        </a>
                    </div>
                </div>
            </section>

            {/* Second Challenges Section */}
            <section className="py-12 px-4 bg-amber-50">
                <div className="container mx-auto">
                    <h3 className="text-2xl font-bold text-orange-100 text-center mb-8">Create Your Own Challenge</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-gray-200"
                            >
                                <img
                                    src={`https://loremflickr.com/300/200/running,race?random=${index + 10}`}
                                    className="w-full h-48 object-cover"
                                    alt="Challenge"
                                />
                                <div className="p-4">
                                    <h4 className="font-bold text-lg text-gray-800">Custom Challenge {index}</h4>
                                    <p className="text-sm text-gray-600">Create your own running challenge!</p>
                                    <span className="text-orange-100 text-sm mt-2 block hover:underline font-medium">
                                      Get Started
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <a href="#" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-8 rounded-md transition inline-block">
                            View All
                        </a>
                    </div>
                </div>
            </section>

            {/* Prizes Section */}
            <section className="py-12 px-4 bg-orange-300">
                <div className="container mx-auto">
                    <h3 className="text-2xl font-bold text-orange-100 text-center mb-8">Prizes</h3>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="flex-shrink-0">
                            <img
                                src="https://loremflickr.com/200/200/trophy,medal?random=1"
                                className="w-32 h-32 object-cover"
                                alt="Prize"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <img
                                src="https://loremflickr.com/200/200/trophy,medal?random=2"
                                className="w-32 h-32 object-cover"
                                alt="Prize"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <img
                                src="https://loremflickr.com/200/200/trophy,medal?random=3"
                                className="w-32 h-32 object-cover"
                                alt="Prize"
                            />
                        </div>
                        <div className="md:w-1/3">
                            <h4 className="font-bold text-lg mb-2">Earn Exclusive Medals</h4>
                            <p className="text-gray-600">
                                Complete challenges to earn unique medals and rewards.
                                Each medal is a testament to your dedication and achievement.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Join Section */}
            <section className="py-12 px-4 bg-amber-50">
                <div className="container mx-auto">
                    <h3 className="text-2xl font-bold text-orange-100 text-center mb-8">How to Join</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["Register", "Participate & Update", "Get Rewards"].map((step, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
                                <img
                                    src={`https://loremflickr.com/150/150/fitness,workout?random=${i}`}
                                    className="w-24 h-24 mx-auto rounded-full border-2 border-orange-accent-100"
                                    alt="Step"
                                />
                                <h4 className="mt-4 font-bold text-gray-800">{step}</h4>
                                <p className="text-sm text-gray-600">
                                    {i === 0 && "Create an account and register for challenges."}
                                    {i === 1 && "Use tracking apps to log your progress."}
                                    {i === 2 && "Get medals and rewards upon completion!"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Media Connect */}
            <section className="py-12 px-4 text-center bg-orange-200 text-white">
                <div className="container mx-auto">
                    <h3 className="text-2xl font-bold mb-6">Connect with Us</h3>
                    <div className="flex justify-center gap-8 mt-6">
                        <a href="#" className="text-white hover:text-yellow-400 text-3xl transition">
                            <i className="fa fa-facebook"></i>
                        </a>
                        <a href="#" className="text-white hover:text-yellow-400 text-3xl transition">
                            <i className="fa fa-instagram"></i>
                        </a>
                        <a href="#" className="text-white hover:text-yellow-400 text-3xl transition">
                            <i className="fa fa-twitter"></i>
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;