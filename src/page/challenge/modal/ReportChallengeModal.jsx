import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {useReportChallengeMutation} from "../../../service/challengeService.js";

const ReportChallengeModal = ({ challengeId, onClose }) => {
    const { t } = useTranslation();
    const [content, setContent] = useState("");
    const [reportType, setReportType] = useState("INAPPROPRIATE_CONTENT");
    const [reportChallenge, { isLoading }] = useReportChallengeMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await reportChallenge({ challengeId, content, reportType });
            toast.success(t("JoinsChallengeDetail.reportSuccess"));
            onClose();
        } catch (e) {
            const errorMessage = e?.data?.message || t("JoinsChallengeDetail.reportFail");
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">{t("JoinsChallengeDetail.reportTitle")}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">{t("JoinsChallengeDetail.reportType")}</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option
                                value="INAPPROPRIATE_CONTENT">{t("JoinsChallengeDetail.type.inappropriate")}</option>
                            <option value="SPAM">{t("JoinsChallengeDetail.type.spam")}</option>
                            <option value="OFFENSIVE_BEHAVIOR">{t("JoinsChallengeDetail.type.harassment")}</option>
                            <option value="RULE_VIOLATION">{t("JoinsChallengeDetail.type.rule")}</option>
                            <option value="OTHER">{t("JoinsChallengeDetail.type.other")}</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">{t("JoinsChallengeDetail.reason")}</label>
                        <textarea
                            className="w-full border rounded px-3 py-2"
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            {t("JoinsChallengeDetail.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            {t("JoinsChallengeDetail.submit")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportChallengeModal;