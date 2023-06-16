import React from "react";

const SearchBar = ({ searchText, onSearchTextChange, onSearch, onClear }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="mb-4">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Search journals..."
          value={searchText}
          onChange={onSearchTextChange}
          onKeyPress={handleKeyPress}
        />
        <button className="btn btn-primary" onClick={onSearch}>
          Search
        </button>
        {searchText.length > 0 && (
          <button className="btn btn-secondary ms-2" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
