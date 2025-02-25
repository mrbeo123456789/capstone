import { createContext, useContext, useState } from "react";

export const PaginationContext = createContext();

export const PaginationProvider = ({ children }) => {
    const [currentPage, setCurrentPage] = useState(0);

    return (
        <PaginationContext.Provider value={{ currentPage, setCurrentPage }}>
            {children}
        </PaginationContext.Provider>
    );
};

export const usePagination = () => {
    return useContext(PaginationContext);
};
