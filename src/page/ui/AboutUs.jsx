import React from "react";
import { ChevronDown, Home } from "lucide-react";
import Header from "./Header.jsx";
import { useTranslation } from "react-i18next";

const AboutUsPage = () => {
    const { t } = useTranslation();

    const scrollToSection = (id) => {
        document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="bg-orange-50 min-h-screen">
            {/* Back to Homepage Button */}
            <div className="sticky top-0 z-50">
                <Header />
            </div>

            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white">
                <div className="container mx-auto px-4 py-20 md:py-32">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("AboutUs.hero.title")}</h1>
                        <p className="text-lg md:text-xl mb-8">
                            {t("AboutUs.hero.subtitle")}
                        </p>
                        <button
                            onClick={() => scrollToSection("mission")}
                            className="flex items-center mx-auto bg-white text-red-600 px-6 py-3 rounded-full font-medium hover:bg-orange-100 transition-colors"
                        >
                            {t("AboutUs.hero.learnMore")}
                            <ChevronDown className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-0 w-full h-16 bg-orange-50 clip-path-wave"></div>
            </div>

            {/* Mission Section */}
            <div id="mission" className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-6">{t("AboutUs.mission.title")}</h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {t("AboutUs.mission.description")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold mb-4 mx-auto">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-orange-600 mb-3 text-center">{t("AboutUs.mission.pillars.connect.title")}</h3>
                            <p className="text-gray-600 text-center">
                                {t("AboutUs.mission.pillars.connect.description")}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold mb-4 mx-auto">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-orange-600 mb-3 text-center">{t("AboutUs.mission.pillars.challenge.title")}</h3>
                            <p className="text-gray-600 text-center">
                                {t("AboutUs.mission.pillars.challenge.description")}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold mb-4 mx-auto">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-orange-600 mb-3 text-center">{t("AboutUs.mission.pillars.impact.title")}</h3>
                            <p className="text-gray-600 text-center">
                                {t("AboutUs.mission.pillars.impact.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-6">{t("AboutUs.team.title")}</h2>
                        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                            {t("AboutUs.team.description")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        {[
                            { name: "Nguyễn Đình Anh Đức", role: t("AboutUs.team.roles.analyst"), image: "/api/placeholder/300/300" },
                            { name: "Lương Thanh Cường", role: t("AboutUs.team.roles.backend"), image: "/api/placeholder/300/300" },
                            { name: "Lê Văn Duy", role: t("AboutUs.team.roles.leader"), image: "/api/placeholder/300/300" },
                            { name: "Nguyễn Xuân Khánh", role: t("AboutUs.team.roles.frontend"), image: "/api/placeholder/300/300" },
                            { name: "Trần Khang Minh", role: t("AboutUs.team.roles.tester"), image: "/api/placeholder/300/300" }
                        ].map((member, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden group">
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                                        <div className="p-4 text-white">
                                            <div className="flex gap-3 mb-2">
                                                <a href="#" className="text-white hover:text-orange-300">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                    </svg>
                                                </a>
                                                <a href="#" className="text-white hover:text-orange-300">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                                    </svg>
                                                </a>
                                                <a href="#" className="text-white hover:text-orange-300">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-semibold text-lg mb-1 text-orange-600">{member.name}</h3>
                                    <p className="text-gray-600">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-6">{t("AboutUs.values.title")}</h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {t("AboutUs.values.description")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: t("AboutUs.values.items.responsibility.title"), description: t("AboutUs.values.items.responsibility.description") },
                            { title: t("AboutUs.values.items.innovation.title"), description: t("AboutUs.values.items.innovation.description") },
                            { title: t("AboutUs.values.items.transparency.title"), description: t("AboutUs.values.items.transparency.description") },
                            { title: t("AboutUs.values.items.collaboration.title"), description: t("AboutUs.values.items.collaboration.description") }
                        ].map((value, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl font-bold mr-4">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-xl font-semibold text-orange-600">{value.title}</h3>
                                </div>
                                <p className="text-gray-600 ml-14">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Journey Section */}
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-6">{t("AboutUs.journey.title")}</h2>
                        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                            {t("AboutUs.journey.description")}
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-12">
                            {[
                                { year: "2023", title: t("AboutUs.journey.milestones.beginning.title"), description: t("AboutUs.journey.milestones.beginning.description") },
                                { year: "2024", title: t("AboutUs.journey.milestones.development.title"), description: t("AboutUs.journey.milestones.development.description") },
                                { year: "2025", title: t("AboutUs.journey.milestones.expansion.title"), description: t("AboutUs.journey.milestones.expansion.description") }
                            ].map((milestone, index) => (
                                <div key={index} className="flex">
                                    <div className="flex flex-col items-center mr-6">
                                        <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                                            {milestone.year}
                                        </div>
                                        {index < 2 && <div className="w-1 flex-1 bg-orange-300 my-2"></div>}
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-md flex-1 hover:shadow-lg transition-shadow">
                                        <h3 className="text-xl font-semibold text-orange-600 mb-2">{milestone.title}</h3>
                                        <p className="text-gray-600">{milestone.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-6">{t("AboutUs.contact.title")}</h2>
                    <p className="text-lg text-gray-700 mb-8">
                        {t("AboutUs.contact.description")}
                    </p>
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
                            <div className="flex flex-col items-center p-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2 text-center">{t("AboutUs.contact.email.title")}</h3>
                                <p className="text-gray-600 text-center">fusep490g4@gmail.com</p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2 text-center">{t("AboutUs.contact.phone.title")}</h3>
                                <p className="text-gray-600 text-center">+84 93 4388662</p>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2 text-center">{t("AboutUs.contact.address.title")}</h3>
                                <p className="text-gray-600 text-center">{t("AboutUs.contact.address.value")}</p>
                            </div>
                        </div>
                        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-colors">
                            {t("AboutUs.contact.button")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom CSS for wave effect */}
            <style>{`
                .clip-path-wave {
                    clip-path: polygon(
                            0% 0%,
                            100% 0%,
                            100% 100%,
                            0% 100%,
                            0% 60%,
                            4% 55%,
                            8% 50%,
                            12% 47%,
                            16% 45%,
                            20% 45%,
                            24% 47%,
                            28% 50%,
                            32% 55%,
                            36% 60%,
                            40% 65%,
                            44% 68%,
                            48% 69%,
                            52% 68%,
                            56% 65%,
                            60% 60%,
                            64% 55%,
                            68% 50%,
                            72% 47%,
                            76% 45%,
                            80% 45%,
                            84% 47%,
                            88% 50%,
                            92% 55%,
                            96% 60%,
                            100% 65%
                    );
                }
            `}</style>
        </div>
    );
};

export default AboutUsPage;