import React from "react";

const SelectedJournal = ({ selectedJournal, formatDate }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Selected Journal:</h5>
        <div>
          <p>Date: {formatDate(selectedJournal.date)}</p>
          <p>Place: {selectedJournal.place}</p>
          {selectedJournal.species_observed && (
            <div>
              <h5>Species Observed:</h5>
              {Object.keys(selectedJournal.species_observed).map((species) => (
                <p key={species}>
                  {species}: {selectedJournal.species_observed[species]}
                </p>
              ))}
            </div>
          )}
          <h4>Notes:</h4>
          <p>{selectedJournal.notes}</p>
        </div>
      </div>
    </div>
  );
};

export default SelectedJournal;
