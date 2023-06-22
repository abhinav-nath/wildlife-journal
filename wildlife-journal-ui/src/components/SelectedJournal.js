import React, { useState, useEffect } from "react";
import useEditForm from "../hooks/useEditForm";

const SelectedJournal = ({
  selectedJournal,
  formatDate,
  handleDelete,
  handleEdit,
}) => {
  const { formState, setFormState, handleInputChange, handleSubmit } =
    useEditForm(selectedJournal, handleEdit);

  const [editMode, setEditMode] = useState(false);

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
            ([species, values]) => (
              <div key={species}>
                <p>
                  {species}: {values}
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
    <div className="card">
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
          {Object.keys(formState.species_observed).map((species) => (
            <div key={species}>
              <input
                type="text"
                name={`species_observed.${species}.name`}
                value={formState.species_observed[species].name}
                onChange={(event) => handleSpeciesInputChange(event, species)}
              />
              <input
                type="text"
                name={`species_observed.${species}.value`}
                value={formState.species_observed[species].value}
                onChange={(event) => handleSpeciesInputChange(event, species)}
              />
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteSpecies(species)}
              >
                Delete
              </button>
            </div>
          ))}
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
