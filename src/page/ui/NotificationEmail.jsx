const NotificationEmail = () => {
    return (
        <div className="max-w-xl mx-auto bg-white p-6 shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div className="flex space-x-4">
                    <span className="font-bold">MEN</span>
                    <span className="font-bold">WOMEN</span>
                    <span className="font-bold">KIDS</span>
                    <span className="font-bold">STORE FINDER</span>
                </div>
            </div>

            {/* Order Confirmation */}
            <h2 className="text-2xl font-extrabold">YOUR ADIDAS ORDER HAS BEEN DELIVERED</h2>
            <p className="mt-2 font-bold">ORDER NUMBER: <span className="bg-gray-200 px-2 py-1 rounded">XXXX-XXXX</span></p>

            {/* Order Details */}
            <p className="mt-4">Hi Nathalia,</p>
            <p className="mt-2">You're up! We just delivered your order. For additional order details, please login to your adidas <a href="#" className="text-blue-600 underline">account</a>.</p>
            <p className="mt-4">Thanks for shopping with adidas.</p>

            {/* Exchange Section */}
            <div className="bg-gray-100 p-4 mt-6 rounded-lg">
                <p className="font-bold">RECEIVED ITEMS THAT DON'T FIT PERFECTLY? SWAP THEM FOR FREE!</p>
                <button className="mt-3 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">MAKE AN EXCHANGE →</button>
            </div>
        </div>
    );
};

export default NotificationEmail;
