
import { ClockIcon, CheckCircleIcon, Search } from "lucide-react";

const MemberListPanel = ({
                             members,
                             currentPage,
                             totalPages,
                             totalElements,
                             currentPageNumber,
                             searchTerm,
                             setSearchTerm,
                             setCurrentPage,
                             selectedMember,
                             setSelectedMember,
                             itemsPerPage = 10
                         }) => {
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

    return (
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-100 px-6 py-3 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Members</h2>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Member Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Evidence Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                        <tr
                            key={member.id}
                            className={`hover:bg-blue-50 cursor-pointer ${selectedMember?.id === member.id ? 'bg-blue-100' : ''}`}
                            onClick={() => setSelectedMember(member)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.evidenceCount || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {member.hasPendingEvidence ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ClockIcon className="mr-1 h-4 w-4" />
                      Pending
                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="mr-1 h-4 w-4" />
                      Done
                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{members.length > 0 ? currentPageNumber * itemsPerPage + 1 : 0}</span> to{' '}
                        <span className="font-medium">{Math.min((currentPageNumber + 1) * itemsPerPage, totalElements)}</span> of{' '}
                        <span className="font-medium">{totalElements}</span> members
                    </p>
                    <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button onClick={prevPage} disabled={currentPageNumber === 0} className="px-2 py-2 text-gray-500 hover:bg-gray-50">‹</button>
                        {[...Array(Math.min(5, totalPages)).keys()].map(number => {
                            const pageNum = currentPageNumber > 2
                                ? currentPageNumber - 2 + number + (totalPages - currentPageNumber < 2 ? totalPages - currentPageNumber - 2 : 0)
                                : number;
                            if (pageNum < totalPages) {
                                return (
                                    <button key={pageNum} onClick={() => paginate(pageNum)} className={`px-4 py-2 text-sm font-semibold ${currentPageNumber === pageNum ? 'bg-blue-500 text-white' : 'text-gray-900 hover:bg-gray-50'}`}>
                                        {pageNum + 1}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        <button onClick={nextPage} disabled={currentPageNumber === totalPages - 1 || totalPages === 0} className="px-2 py-2 text-gray-500 hover:bg-gray-50">›</button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default MemberListPanel;