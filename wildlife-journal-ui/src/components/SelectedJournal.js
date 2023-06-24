import React, { useState, useEffect } from "react";
import useEditForm from "../hooks/useEditForm";

const SelectedJournal = ({
  selectedJournal,
  formatDate,
  handleDelete,
  handleEdit,
  editMode,
  setEditMode,
}) => {
  const { formState, setFormState, handleInputChange, handleSubmit } =
    useEditForm(selectedJournal, handleEdit);

  useEffect(() => {
    // Set initial values for species observed when entering edit mode
    if (editMode) {
      setFormState({
        ...selectedJournal,
        species_observed: selectedJournal.species_observed || {},
      });
    }
  }, [editMode, selectedJournal, setFormState]);

  const handleSpeciesInputChange = (event, species) => {
    const { name, value } = event.target;
    const updatedSpeciesObserved = {
      ...formState.species_observed,
      [species]: {
        ...formState.species_observed[species],
        [name]: value,
      },
    };
    handleInputChange({
      target: { name: "species_observed", value: updatedSpeciesObserved },
    });
  };

  const handleDeleteSpecies = (species) => {
    const updatedSpeciesObserved = { ...formState.species_observed };
    delete updatedSpeciesObserved[species];
    handleInputChange({
      target: { name: "species_observed", value: updatedSpeciesObserved },
    });
  };

  const renderSpeciesObserved = () => {
    if (selectedJournal.species_observed) {
      return (
        <div>
          <h5>Species Observed:</h5>
          {Object.entries(selectedJournal.species_observed).map(
            ([species, count]) => (
              <div key={species}>
                <p>
                  {species}: {count}
                </p>
              </div>
            )
          )}
        </div>
      );
    }
    return null;
  };

  const renderEditMode = () => (
    console.log("species_observed", formState.species_observed),
    (
      <div className="card" style={{ width: "450px" }}>
        <form onSubmit={handleSubmit}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <input
              type="text"
              name="place"
              value={formState.place}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="date"
              value={formState.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="card-body">
            <h5>Species Observed:</h5>
            {Object.entries(formState.species_observed).map(
              ([species, count]) => (
                console.log(species, count),
                (
                  <div key={species} className="d-flex mb-2">
                    <input
                      type="text"
                      name={species}
                      value={species}
                      onChange={(event) =>
                        handleSpeciesInputChange(event, species)
                      }
                      style={{ marginRight: "8px" }}
                    />
                    <input
                      type="text"
                      name={count}
                      value={count}
                      onChange={(event) =>
                        handleSpeciesInputChange(event, count)
                      }
                      style={{ marginRight: "8px" }}
                    />
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteSpecies(species)}
                      style={{ marginLeft: "8px" }}
                    >
                      x
                    </button>
                  </div>
                )
              )
            )}
            <h5>Notes:</h5>
            <textarea
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
            ></textarea>
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  );

  const renderViewMode = () => (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6>{selectedJournal.place}</h6>
        <h6 className="card-title">{formatDate(selectedJournal.date)}</h6>
      </div>
      <div className="card-body">
        {renderSpeciesObserved()}
        <h5>Notes:</h5>
        <p className="card-text">{selectedJournal.notes}</p>
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(selectedJournal)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return editMode ? renderEditMode() : renderViewMode();
};

export default SelectedJournal;
