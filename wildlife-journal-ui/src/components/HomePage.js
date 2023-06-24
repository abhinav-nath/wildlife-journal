import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useEditJournal from "../hooks/useEditJournal";

import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import JournalList from "./JournalList";
import SelectedJournal from "./SelectedJournal";

const HomePage = () => {
  const [latestJournals, setLatestJournals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearchButtonEnabled, setIsSearchButtonEnabled] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
  });

  const fetchLatestJournals = async (page) => {
    try {
      let url = `http://localhost:8000/journals?page=${page}&size=${pagination.size}`;
      if (searchText) {
        url += `&search_text=${searchText}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setLatestJournals(data.journals);
      setLoading(false);
      setPagination((prevPagination) => ({
        ...prevPagination,
        totalPages: Math.ceil(data.totalCount / prevPagination.size),
      }));
    } catch (error) {
      console.log("Error fetching latest journals:", error);
    }
  };

  useEffect(() => {
    fetchLatestJournals(pagination.page);
  }, [pagination.page, pagination.size]);

  const handleEdit = useEditJournal(
    selectedJournal,
    fetchLatestJournals,
    pagination,
    setSelectedJournal
  );

  const handleSearchTextChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setIsSearchButtonEnabled(value.length > 0);
    setSelectedJournal(null);
    setSearchResults([]);
    setErrorMessage("");
  };

  const handleSearch = async () => {
    try {
      setSelectedJournal(null);
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/journals?search_text=${searchText}`
      );
      const data = await response.json();
      setSearchResults(data.journals);
      setLoading(false);
      setErrorMessage(data.journals.length === 0 ? "No results found." : "");
    } catch (error) {
      console.log("Error searching journals:", error);
    }
  };

  const handleJournalClick = (journal) => {
    setSelectedJournal(journal);
    setEditMode(false);
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
    fetchLatestJournals(page);
  };

  const handleDelete = async (journal) => {
    try {
      if (window.confirm("Are you sure you want to delete this journal?")) {
        const response = await fetch(
          `http://localhost:8000/journals/${journal.id}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        console.log("Deleted journal:", data);
        setSelectedJournal(null);
        fetchLatestJournals(pagination.page);
      }
    } catch (error) {
      console.log("Error deleting journal:", error);
    }
  };

  const renderPaginationButtons = () => {
    const { page, totalPages } = pagination;
    const paginationButtons = [];

    if (page > 1) {
      paginationButtons.push(
        <li className="page-item" key="previous">
          <button
            className="page-link"
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </button>
        </li>
      );
    }

    paginationButtons.push(
      <li className="page-item active" key={page}>
        <span className="page-link">{page}</span>
      </li>
    );

    if (page < totalPages) {
      paginationButtons.push(
        <li className="page-item" key="next">
          <button
            className="page-link"
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </button>
        </li>
      );
    }

    return paginationButtons;
  };

  const renderSearchResults = () => {
    return (
      <>
        <h2>Search Results:</h2>
        <JournalList
          journals={searchResults}
          selectedJournal={selectedJournal}
          onJournalClick={handleJournalClick}
          formatDate={formatDate}
        />
        {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
      </>
    );
  };

  const renderLatestJournals = () => {
    return (
      <>
        <h2 style={{ display: "flex", justifyContent: "space-between" }}>
          Latest Journals
          <Link to="/create-journal" className="btn btn-primary ml-2">
            +
          </Link>
        </h2>
        <JournalList
          journals={latestJournals}
          selectedJournal={selectedJournal}
          onJournalClick={handleJournalClick}
          formatDate={formatDate}
        />
        {latestJournals.length > 0 && (
          <nav aria-label="Latest Journals Pagination" className="mt-4">
            <ul className="pagination justify-content-center">
              {renderPaginationButtons()}
            </ul>
          </nav>
        )}
      </>
    );
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
          {searchResults.length > 0
            ? renderSearchResults()
            : !loading && searchText.length === 0 && renderLatestJournals()}
        </div>
        <div className="col-md-4">
          {selectedJournal && (
            <SelectedJournal
              selectedJournal={selectedJournal}
              formatDate={formatDate}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
