import React, { useState, useEffect } from 'react';

const ReportDetail = ({ reportId, onApprove, onReject }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Status badge colors
    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800'
    };

    // Report type descriptions
    const reportTypeDescriptions = {
        INAPPROPRIATE_CONTENT: 'Content that violates community guidelines',
        OFFENSIVE_BEHAVIOR: 'Behavior that is harmful or offensive to others',
        RULE_VIOLATION: 'Violation of platform rules',
        SPAM: 'Unsolicited or repetitive content',
        OTHER: 'Other issues not fitting the categories above'
    };

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                // Replace with your actual API endpoint
                const response = await fetch(`/api/reports/${reportId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch report details');
                }

                const data = await response.json();
                setReport(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (reportId) {
            fetchReportData();
        }
    }, [reportId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md text-red-700">
                <h2 className="text-lg font-semibold">Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="bg-gray-50 p-4 rounded-md">
                <p>No report found with ID: {reportId}</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
        }).format(date);
    };

    const handleApprove = () => {
        if (onApprove) {
            onApprove(report.id);
        }
    };

    const handleReject = () => {
        if (onReject) {
            onReject(report.id);
        }
    };

    return (
        <div className="bg-white rounded-lg max-w-4xl mx-auto">
            <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Report #{report.id}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status]}`}>
                        {report.status}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Created: {formatDate(report.created_at)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Report Details</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Report Type</dt>
                                <dd className="mt-1">{report.report_type}</dd>
                                <dd className="text-sm text-gray-500">{reportTypeDescriptions[report.report_type]}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Challenge ID</dt>
                                <dd className="mt-1">{report.challenge_id}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Reporter ID</dt>
                                <dd className="mt-1">{report.reporter_id}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Content</h2>
                    <div className="bg-gray-50 p-4 rounded-md h-full">
                        <p className="whitespace-pre-wrap">{report.content}</p>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4 mt-4">
                <div className="flex justify-end space-x-3">
                    {report.status === 'PENDING' && (
                        <>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={handleReject}
                            >
                                Reject
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                onClick={handleApprove}
                            >
                                Approve
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetail;