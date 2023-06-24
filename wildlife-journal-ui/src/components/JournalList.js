import React from "react";

const JournalList = ({
  journals,
  selectedJournal,
  onJournalClick,
  formatDate,
}) => {
  return (
    <ul className="list-group">
      {journals &&
        journals.map((journal) => (
          <li
            key={journal.id}
            className={`list-group-item ${
              selectedJournal && 
              selectedJournal.id === journal.id ? "active" : ""
            }`}
            onClick={() => onJournalClick(journal)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex justify-content-between">
              <div>{journal.place}</div>
              <p className="journal-date">{formatDate(journal.date)}</p>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default JournalList;
