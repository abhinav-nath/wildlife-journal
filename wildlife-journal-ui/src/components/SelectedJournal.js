import React, { useState, useEffect } from "react";

const SelectedJournal = ({
  selectedJournal,
  formatDate,
  handleDelete,
  handleEdit,
  editMode,
  setEditMode,
}) => {
  const [formState, setFormState] = useState(selectedJournal);

  useEffect(() => {
    if (editMode) {
      setFormState((prevState) => ({
        ...prevState,
        species_observed: selectedJournal.species_observed || {},
      }));
    } else {
      setFormState(selectedJournal);
    }
  }, [editMode, selectedJournal]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDeleteSpecies = (species) => {
    const updatedSpeciesObserved = { ...formState.species_observed };
    delete updatedSpeciesObserved[species];
    setFormState((prevState) => ({
      ...prevState,
      species_observed: updatedSpeciesObserved,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleEdit(formState);
  };

  const handleAddSpecies = (event) => {
    event.preventDefault();
    const species = prompt("Enter the species:");
    const count = prompt("Enter the count:");
    if (species && count) {
      setFormState((prevState) => ({
        ...prevState,
        species_observed: {
          ...prevState.species_observed,
          [species]: count,
        },
      }));
    }
  };

  const renderSpeciesObserved = () => {
    if (formState.species_observed) {
      return (
        <div>
          <h5>Species Observed:</h5>
          <table className="table">
            <tbody>
              {Object.entries(formState.species_observed).map(
                ([species, count]) => (
                  <tr key={species}>
                    <td>{species}</td>
                    <td>{count}</td>
                    {editMode && (
                      <td className="text-right align-middle">
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteSpecies(species)}
                        >
                          x
                        </button>
                      </td>
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
          {editMode && (
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-sm btn-success"
                onClick={handleAddSpecies}
              >
                +
              </button>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderEditMode = () => (
    <div className="card" style={{ width: "450px" }}>
      <form onSubmit={handleSubmit}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <input
            type="text"
            name="place"
            className="form-control"
            value={formState.place}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="date"
            className="form-control"
            value={formState.date}
            onChange={handleInputChange}
            style={{ width: "40%", marginLeft: "10px" }}
          />
        </div>
        <div className="card-body">
          {renderSpeciesObserved()}
          <h5>Notes:</h5>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleInputChange}
            className="form-control"
            style={{ width: "100%", height: "120px", marginBottom: "10px" }}
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
        <h6>{formState.place}</h6>
        <h6 className="card-title">{formatDate(formState.date)}</h6>
      </div>
      <div className="card-body">
        {renderSpeciesObserved()}
        <h5>Notes:</h5>
        <p className="card-text">{formState.notes}</p>
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
