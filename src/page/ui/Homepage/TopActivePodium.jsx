const TopActivePodium = () => {
    return (
        <div className="flex justify-between flex-col bg-white rounded-2xl shadow-md h-[410px]">
            <h2 className="text-xl font-bold text-center mb-4">Hoạt động sôi nổi</h2>
            <div className="flex justify-center space-x-6 h-full">
                <div className="text-center h-full content-end">
                    <div className="bg-gray-300 rounded-t-lg w-16 h-2/4 flex items-end justify-center pb-1">2</div>
                    <p>Hiếu</p>
                    <p className="text-sm text-gray-600">Điểm: 90</p>
                </div>
                <div className="text-center h-full content-end">
                    <div className="bg-yellow-400 rounded-t-lg w-16 h-3/4 flex items-end justify-center pb-1">1</div>
                    <p>Nam</p>
                    <p className="text-sm text-gray-600">Điểm: 120</p>
                </div>
                <div className="text-center h-full content-end">
                    <div className="bg-gray-300 rounded-t-lg w-16 h-1/4 flex items-end justify-center pb-1">3</div>
                    <p>Hà</p>
                    <p className="text-sm text-gray-600">Điểm: 80</p>
                </div>
            </div>
        </div>
    );
};

export default TopActivePodium;