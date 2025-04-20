import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { useGetGrowthQuery, useGetSummaryQuery } from "../../../service/adminService";

const Charts = () => {
    const navigate = useNavigate();
    const [timePeriod, setTimePeriod] = useState("MONTH");
    const { data: growthData = {}, isLoading } = useGetGrowthQuery({ range: timePeriod });

    const chartData = useMemo(() => {
        if (!growthData || !growthData.dates) return [];

        return growthData.dates.map((date, index) => ({
            date,
            newMembers: growthData.newMembers?.[index] ?? 0,
            newChallenges: growthData.newChallenges?.[index] ?? 0,
        }));
    }, [growthData]);

    // Lấy dữ liệu summary từ API cho pie chart
    const { data: summaryData, isLoading: summaryLoading, isError: summaryError } = useGetSummaryQuery();

    // Chuyển đổi challengeStatusCounts từ backend thành mảng dữ liệu cho pie chart
    // Ép kiểu các giá trị thành số và nếu không hợp lệ thì mặc định về 0
    const challengeStatusCounts = summaryData?.challengeStatusCounts || {};
    const challengesData = Object.entries(challengeStatusCounts).map(([key, value]) => {
        let color = "#9ca3af";
        switch (key) {
            case "UPCOMING":
                color = "#10b981";
                break;
            case "ONGOING":
                color = "#f97316";
                break;
            case "BANNED":
                color = "#3b82f6";
                break;
            case "CANCELED":
                color = "#e0dee8";
                break;
            case "APPROVED":
                color = "#8b5cf6";  // Purple
                break;
            case "FINISH":
                color = "#0ea5e9";  // Sky blue
                break;
            case "REJECTED":
                color = "#f43f5e";  // Rose/pink
                break;
            default:
                color = "#9ca3af";  // Default gray
        }
        return { name: key, value: Number(value) || 0, color };
    });
    const totalChallenges = challengesData.reduce((acc, item) => acc + item.value, 0);

    // Hàm xử lý khi người dùng nhấp vào một phần của biểu đồ tròn
    const handlePieClick = (data, index) => {
        const status = data.name;
        // Điều hướng đến trang danh sách challenge với tham số status
        navigate(`/admin/challengemanagement?status=${status}`);
    };

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-800">{payload[0].name}</p>
                    <p className="text-lg font-bold text-orange-600">{payload[0].value} Challenges</p>
                    <p className="text-sm text-gray-500">
                        {totalChallenges > 0 ? ((payload[0].value / totalChallenges) * 100).toFixed(1) : "0"}% of total
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLineTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="font-semibold">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 gap-6 mt-4">
            {/* Growth Line Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                    <h2 className="text-orange-800 font-bold text-lg">Growth Analysis</h2>
                    <div className="flex gap-2">
                        {["WEEK", "MONTH", "YEAR", "ALL"].map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    timePeriod === period
                                        ? "bg-orange-500 text-white"
                                        : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                }`}
                            >
                                {period.charAt(0) + period.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 border-b-2"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={{ stroke: "#e5e7eb" }}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis stroke="#6b7280" axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
                            <Tooltip content={<CustomLineTooltip />} />
                            <Legend verticalAlign="bottom" height={36} />
                            <Line
                                name="New Members"
                                type="monotone"
                                dataKey="newMembers"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: "#ea580c" }}
                            />
                            <Line
                                name="New Challenges"
                                type="monotone"
                                dataKey="newChallenges"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: "#2563eb" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                )}
            </div>

            {/* Challenge Status Donut Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <h2 className="text-orange-800 font-bold mb-4 text-lg">Challenge Status</h2>
                <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-2/3 h-80 flex justify-center items-center">
                        {summaryLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 border-b-2"></div>
                            </div>
                        ) : summaryError ? (
                            <div className="text-red-500">Error loading summary data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={challengesData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        innerRadius={75}
                                        paddingAngle={3}
                                        cornerRadius={4}
                                        stroke="none"
                                        onClick={handlePieClick}
                                        cursor="pointer"
                                    >
                                        {challengesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-medium text-gray-500">Total</span>
                            <span className="text-3xl font-extrabold text-orange-600">{totalChallenges}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col justify-center space-y-4 mt-4 md:mt-0 md:ml-6">
                        {challengesData.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center p-2 rounded-md hover:bg-orange-50 transition-colors cursor-pointer"
                                onClick={() => handlePieClick(item, index)}
                            >
                                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                                <div>
                                    <span className="text-gray-800 font-medium block">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-gray-700">{item.value}</span>
                                        <span className="text-xs text-gray-500">
                                            ({totalChallenges > 0 ? ((item.value / totalChallenges) * 100).toFixed(0) : "0"}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Charts;