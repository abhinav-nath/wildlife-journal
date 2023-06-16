import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import JournalList from "./JournalList";

const HomePage = () => {
  const [latestJournals, setLatestJournals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearchButtonEnabled, setIsSearchButtonEnabled] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });

  useEffect(() => {
    fetchLatestJournals();
  }, [pagination]);

  const fetchLatestJournals = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/journals?page=${pagination.page}&size=${pagination.size}`
      );
      const data = await response.json();
      setLatestJournals(data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching latest journals:", error);
    }
  };

  const handleSearchTextChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setIsSearchButtonEnabled(value.length > 0);
  };

  const handleSearch = async () => {
    try {
      setSelectedJournal(null);
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/journals/search?search_text=${searchText}`
      );
      const data = await response.json();
      setSearchResults(data);
      setLoading(false);
      if (data.length === 0) {
        setErrorMessage("No results found.");
        setSelectedJournal(null);
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      console.log("Error searching journals:", error);
    }
  };

  const handleJournalClick = (journal) => {
    setSelectedJournal(journal);
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  const clearSelectedJournal = () => {
    setSelectedJournal(null);
    setSearchResults([]);
    setErrorMessage("");
    setSearchText("");
    setIsSearchButtonEnabled(false);
  };

  const handlePageChange = (page) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: page,
    }));
  };

  return (
    <div className="container py-4">
      <Navbar />

      <div className="row">
        <div className="col-md-8">
          <SearchBar
            searchText={searchText}
            onSearchTextChange={handleSearchTextChange}
            onSearch={handleSearch}
            onClear={clearSelectedJournal}
            isSearchButtonEnabled={isSearchButtonEnabled}
          />

          {searchResults.length > 0 ? (
            <div>
              <h2>Search Results:</h2>
              <JournalList
                journals={searchResults}
                selectedJournal={selectedJournal}
                onJournalClick={handleJournalClick}
                formatDate={formatDate}
              />
              {errorMessage && (
                <p className="alert alert-danger">{errorMessage}</p>
              )}
            </div>
          ) : !loading && !errorMessage && searchText.length === 0 ? (
            <div>
              <h2>Latest Journals</h2>
              <JournalList
                journals={latestJournals}
                selectedJournal={selectedJournal}
                onJournalClick={handleJournalClick}
                formatDate={formatDate}
              />
              {latestJournals.length > 0 && (
                <nav aria-label="Latest Journals Pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${
                        pagination.page === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">{pagination.page}</span>
                    </li>
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          ) : null}
        </div>

        <div className="col-md-4">
          {selectedJournal && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Selected Journal:</h5>
                <div>
                  <p>Date: {formatDate(selectedJournal.date)}</p>
                  <p>Place: {selectedJournal.place}</p>
                  {selectedJournal.species_observed && (
                    <div>
                      <h5>Species Observed:</h5>
                      {Object.keys(selectedJournal.species_observed).map(
                        (species) => (
                          <p key={species}>
                            {species}:{" "}
                            {selectedJournal.species_observed[species]}
                          </p>
                        )
                      )}
                    </div>
                  )}
                  <h4>Notes:</h4>
                  <p>{selectedJournal.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
