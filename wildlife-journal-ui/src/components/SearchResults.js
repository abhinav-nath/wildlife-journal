import React from "react";

const SearchResults = ({ searchResults }) => {
  return (
    <div>
      {searchResults.length > 0 ? (
        <div>
          <h2>Search Results:</h2>
          <ul className="list-group">
            {searchResults.map((journal) => (
              <li key={journal.id} className="list-group-item">
                {/* Journal details */}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="alert alert-warning" role="alert">
          No results found.
        </div>
      )}
    </div>
  );
};

export default SearchResults;
