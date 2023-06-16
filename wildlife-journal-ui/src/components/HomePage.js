import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [latestJournals, setLatestJournals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Fetch latest journals on component mount
  useEffect(() => {
    fetchLatestJournals();
  }, []);

  // Fetch latest journals
  const fetchLatestJournals = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/journals?page=1&size=10"
      );
      const data = await response.json();
      setLatestJournals(data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching latest journals:", error);
    }
  };

  // Handle search text change
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle search
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/journals/search?search_text=${searchText}`
      );
      const data = await response.json();
      setSearchResults(data);
      setLoading(false);
    } catch (error) {
      console.log("Error searching journals:", error);
    }
  };

  // Handle journal click
  const handleJournalClick = (journal) => {
    setSelectedJournal(journal);
  };

  // Clear selected journal and search results
  const clearSelectedJournal = () => {
    setSelectedJournal(null);
    setSearchResults([]);
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="container py-4">
      <nav className="navbar navbar-expand navbar-light bg-light mb-4">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            Forest Journals
          </Link>
        </div>
      </nav>

      <div className="row">
        <div className="col-md-8">
          <div className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search journals..."
                value={searchText}
                onChange={handleSearchTextChange}
              />
              <button className="btn btn-primary" onClick={handleSearch}>
                Search
              </button>
              {searchResults.length > 0 && (
                <button
                  className="btn btn-secondary ms-2"
                  onClick={clearSelectedJournal}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div>
              <h2>Search Results:</h2>
              <ul className="list-group">
                {searchResults.map((journal) => (
                  <li
                    key={journal.id}
                    className={`list-group-item ${
                      selectedJournal === journal ? "active" : ""
                    }`}
                    onClick={() => handleJournalClick(journal)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between">
                      <div>{journal.place}</div>
                      <p className="journal-date">{formatDate(journal.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {searchResults.length === 0 && <p>No results found.</p>}
            </div>
          ) : (
            <div>
              <h2>Latest Journals</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ul className="list-group">
                  {latestJournals.map((journal) => (
                    <li
                      key={journal.id}
                      className={`list-group-item ${
                        selectedJournal === journal ? "active" : ""
                      }`}
                      onClick={() => handleJournalClick(journal)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-between">
                        <div>{journal.place}</div>
                        <p className="journal-date">
                          {formatDate(journal.date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Selected Journal:</h5>
              {selectedJournal ? (
                <div>
                  <p>Date: {formatDate(selectedJournal.date)}</p>
                  <p>Place: {selectedJournal.place}</p>
                  <p>Species Observed: {selectedJournal.species_observed}</p>
                  <p>Notes: {selectedJournal.notes}</p>
                </div>
              ) : (
                <p>No journal selected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
