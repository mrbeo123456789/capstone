import React from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const AboutUsPage = () => {
    const { t } = useTranslation();

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className=" text-white min-h-screen">
            {/* Hero Section */}
            <div className="">
                <div className="container mx-auto px-4 py-20 md:py-28 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("AboutUs.hero.title")}</h1>
                    <p className="text-lg mb-6">{t("AboutUs.hero.subtitle")}</p>
                    <button
                        onClick={() => scrollToSection("mission")}
                        className="px-6 py-2 border border-gray-600 rounded hover:bg-gray-200 transition"
                    >
                        {t("AboutUs.hero.learnMore")} <ChevronDown className="inline-block ml-1 w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Mission Section */}
            <div id="mission" className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-8">{t("AboutUs.mission.title")}</h2>
                <p className="text-center text-white mb-12">{t("AboutUs.mission.description")}</p>
                <div className="grid md:grid-cols-3 gap-6">
                    {["connect", "challenge", "impact"].map((key, index) => (
                        <div key={index} className=" border p-6 rounded shadow-sm">
                            <div className="w-10 h-10 flex items-center justify-center font-bold text-lg mx-auto mb-4 border border-gray-400 rounded-full">
                                {index + 1}
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-2">
                                {t(`AboutUs.mission.pillars.${key}.title`)}
                            </h3>
                            <p className="text-center text-sm text-white">
                                {t(`AboutUs.mission.pillars.${key}.description`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Section */}
            <div className=" py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">{t("AboutUs.team.title")}</h2>
                    <p className="text-center text-white mb-12">{t("AboutUs.team.description")}</p>
                    <div className="grid md:grid-cols-5 gap-6">
                        {[
                            { name: "Nguyễn Đình Anh Đức", role: t("AboutUs.team.roles.analyst") },
                            { name: "Lương Thanh Cường", role: t("AboutUs.team.roles.backend") },
                            { name: "Lê Văn Duy", role: t("AboutUs.team.roles.leader") },
                            { name: "Nguyễn Xuân Khánh", role: t("AboutUs.team.roles.frontend") },
                            { name: "Trần Khang Minh", role: t("AboutUs.team.roles.tester") },
                        ].map((member, index) => (
                            <div key={index} className=" border rounded text-center p-4">
                                <div className="w-full h-40 bg-gray-200 rounded mb-4" />
                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                <p className="text-sm text-white">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-8">{t("AboutUs.values.title")}</h2>
                <p className="text-center text-white mb-12">{t("AboutUs.values.description")}</p>
                <div className="grid md:grid-cols-2 gap-6">
                    {["responsibility", "innovation", "transparency", "collaboration"].map((key, index) => (
                        <div key={index} className=" border p-6 rounded shadow-sm">
                            <h3 className="text-xl font-semibold mb-2">{t(`AboutUs.values.items.${key}.title`)}</h3>
                            <p className="text-white text-sm">{t(`AboutUs.values.items.${key}.description`)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Journey Section */}
            <div className=" py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">{t("AboutUs.journey.title")}</h2>
                    <p className="text-center text-white mb-12">{t("AboutUs.journey.description")}</p>
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {["beginning", "development", "expansion"].map((key, index) => (
                            <div key={index} className=" border rounded p-4">
                                <h3 className="text-xl font-bold mb-2">{t(`AboutUs.journey.milestones.${key}.title`)}</h3>
                                <p className="text-white text-sm">{t(`AboutUs.journey.milestones.${key}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-8">{t("AboutUs.contact.title")}</h2>
                <p className="text-center text-white mb-6">{t("AboutUs.contact.description")}</p>
                <div className=" border p-8 rounded max-w-3xl mx-auto text-center space-y-4">
                    <p><strong>{t("AboutUs.contact.email.title")}:</strong> fusep490g4@gmail.com</p>
                    <p><strong>{t("AboutUs.contact.phone.title")}:</strong> +84 93 4388662</p>
                    <p><strong>{t("AboutUs.contact.address.title")}:</strong> {t("AboutUs.contact.address.value")}</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
