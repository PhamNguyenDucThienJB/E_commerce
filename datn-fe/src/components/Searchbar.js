import React, { useState, useEffect } from "react";
import { searchByKeyword } from "../api/ProductApi";
import { NavLink } from "react-router-dom";
import "../static/css/searchbar.css";


const SearchBar = () => {
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (keyword.trim().length > 0) {
                searchByKeyword(1, 5, keyword).then((res) => {
                    setSuggestions(res.data || []);
                    setShowDropdown(true);
                });
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300); // debounce 300ms

        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const handleSelect = () => {
        setShowDropdown(false);
        setKeyword("");
    };

    return (
        <div className="search-wrapper position-relative">
            <input
                type="text"
                className="form-control"
                placeholder="Tìm sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => keyword && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // tránh mất dropdown khi click link
                autoComplete="off"
            />
            {showDropdown && suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 bg-white border mt-1 z-3" style={{ maxHeight: 300, overflowY: "auto" }}>
                    {suggestions.map((item) => (
                        <li key={item.id} className="list-group-item py-2">
                            <NavLink
                                to={`/product-detail/${item.id}`}
                                className="text-decoration-none text-dark"
                                onClick={handleSelect}
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
