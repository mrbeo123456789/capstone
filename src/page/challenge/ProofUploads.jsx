import { FaPlus } from "react-icons/fa";

const proofUploads = [
    { day: 1, time: "19:13", uploaded: true, image: "https://emi.parkview.com/media/Image/Dashboard_952_The-many-health-benefits-of-regular-exercise_11_20.jpg" },
    { day: 2, time: "19:13", uploaded: true, image: "https://media-cldnry.s-nbcnews.com/image/upload/t_social_share_1024x768_scale,f_auto,q_auto:best/newscms/2015_18/512061/exercise-outside-woman-stock-today-150427-tease.jpg" },
    { day: 3, time: "19:13", uploaded: true, image: "https://exerciseright.com.au/wp-content/uploads/2020/05/image-from-rawpixel-id-2107431-jpeg-compressed.jpg" },
    { day: 4, uploaded: false },
    { day: 5, uploaded: false },
    { day: 5, uploaded: false },
    { day: 5, uploaded: false },
    { day: 5, uploaded: false },
    { day: 5, uploaded: false },
    { day: 5, uploaded: false },
];

const ProofUploads = () => {
    return (
        <div className="mt-6 w-full mx-auto overflow-hidden">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                {proofUploads.map((proof, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div>{`Day ${proof.day}`}</div>
                        {proof.uploaded ? (
                            <div className="w-24 h-24 bg-gray-300 flex items-center justify-center rounded-lg shadow-md">
                                <img
                                    src={proof.image}
                                    alt={`Day ${proof.day}`}
                                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-gray-300 flex items-center justify-center rounded-lg shadow-md">
                                <button className="text-gray-600">
                                    <FaPlus className="text-3xl" />
                                </button>
                            </div>
                        )}
                        <p className="mt-2 text-sm text-gray-700">
                            {proof.uploaded ? proof.time : "Upload your proof"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProofUploads;
