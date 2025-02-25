import React, { createContext, useContext, useState } from "react";

// Tạo SearchContext
const SearchContext = createContext();

// Tạo custom hook để sử dụng context
export const useSearch = () => useContext(SearchContext);

// Tạo Provider để bao bọc các component cần sử dụng search
export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const updateSearch = (search) => {
        setSearchTerm(search); // Cập nhật giá trị tìm kiếm
    };

    return (
        <SearchContext.Provider value={{ searchTerm, updateSearch }}>
            {children}
        </SearchContext.Provider>
    );
};
