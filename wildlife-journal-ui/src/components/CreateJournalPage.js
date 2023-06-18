import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Container, Form, Button, Alert } from "react-bootstrap";

const CreateJournalPage = () => {
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [speciesObserved, setSpeciesObserved] = useState([]);
  const [notes, setNotes] = useState("");
  const [dateError, setDateError] = useState(false);
  const [placeError, setPlaceError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setDate(currentDate);
  }, []);

  const handleAddSpecies = () => {
    setSpeciesObserved([...speciesObserved, { species: "", count: 0 }]);
  };

  const handleSpeciesChange = (index, field, value) => {
    const updatedSpeciesObserved = [...speciesObserved];
    updatedSpeciesObserved[index][field] = value;
    setSpeciesObserved(updatedSpeciesObserved);
  };

  const handleDeleteSpecies = (index) => {
    const updatedSpeciesObserved = [...speciesObserved];
    updatedSpeciesObserved.splice(index, 1);
    setSpeciesObserved(updatedSpeciesObserved);
  };

  const handleSubmit = () => {
    // Validate fields
    if (!date || !place) {
      setDateError(!date);
      setPlaceError(!place);
      return;
    }

    // Prepare the payload
    const payload = {
      date,
      place,
      species_observed: Object.fromEntries(
        speciesObserved.map(({ species, count }) => [species, count])
      ),
      notes,
    };

    // Call the backend API to create a new journal
    fetch("http://localhost:8000/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        // Clear the form fields
        setDate("");
        setPlace("");
        setSpeciesObserved([]);
        setNotes("");
        console.log("Journal created:", data);
      });
  };

  const handlePlaceChange = (e) => {
    setPlace(e.target.value);
    setPlaceError(false); // Clear the place error when the user starts typing
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Container className="w-50">
      <Navbar />
      <h1>Create a Journal</h1>

      <Form>
        <Form.Group controlId="date" className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            isInvalid={dateError}
          />
          {dateError && <Alert variant="danger">Please provide a date.</Alert>}
        </Form.Group>

        <Form.Group controlId="place" className="mb-3">
          <Form.Label>Place</Form.Label>
          <Form.Control
            type="text"
            value={place}
            onChange={handlePlaceChange}
            isInvalid={placeError}
          />
          {placeError && (
            <Alert variant="danger">Please provide a place.</Alert>
          )}
        </Form.Group>

        <Form.Group controlId="speciesObserved" className="mb-3">
          <div className="d-flex align-items-center mb-3">
            <Form.Label className="me-2">Species Observed</Form.Label>
            {speciesObserved.map((species, index) => (
              <div key={index} className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Species"
                  value={species.species}
                  onChange={(e) =>
                    handleSpeciesChange(index, "species", e.target.value)
                  }
                />
                <Form.Control
                  type="number"
                  placeholder="Count"
                  value={species.count}
                  onChange={(e) =>
                    handleSpeciesChange(index, "count", e.target.value)
                  }
                />
                <Button
                  variant="danger"
                  onClick={() => handleDeleteSpecies(index)}
                  className="ms-2"
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              variant="primary"
              onClick={handleAddSpecies}
              className="ms-2"
            >
              +
            </Button>
          </div>
        </Form.Group>

        <Form.Group controlId="notes" className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-between mb-3">
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateJournalPage;
