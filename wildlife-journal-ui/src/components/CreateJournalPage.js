import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";

const CreateJournalPage = () => {
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [speciesObserved, setSpeciesObserved] = useState([]);
  const [notes, setNotes] = useState("");

  const handleAddSpecies = () => {
    setSpeciesObserved([...speciesObserved, { species: "", count: 0 }]);
  };

  const handleSpeciesChange = (index, field, value) => {
    const updatedSpeciesObserved = [...speciesObserved];
    updatedSpeciesObserved[index][field] = value;
    setSpeciesObserved(updatedSpeciesObserved);
  };

  const handleSubmit = () => {
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
    fetch("/api/journals", {
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

  return (
    <Container>
      <h1>Create a Journal</h1>

      <Form>
        <Form.Group controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="place">
          <Form.Label>Place</Form.Label>
          <Form.Control
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="speciesObserved">
          <Form.Label>Species Observed</Form.Label>
          {speciesObserved.map((species, index) => (
            <div key={index}>
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
            </div>
          ))}
          <Button variant="primary" onClick={handleAddSpecies}>
            Add Species
          </Button>
        </Form.Group>

        <Form.Group controlId="notes">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleSubmit}>
          Create Journal
        </Button>
      </Form>
    </Container>
  );
};

export default CreateJournalPage;
