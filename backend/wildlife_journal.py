from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import csv
import json
from typing import List, Dict

from pydantic import BaseModel


# Define the path to the CSV file
CSV_FILE = "journals.csv"


class Journal(BaseModel):
    id: int
    date: str
    place: str
    species_observed: Dict[str, int]
    notes: str


# Helper function to read journals from CSV file
def read_journals():
    with open(CSV_FILE, "r") as file:
        reader = csv.DictReader(file)
        journals = list(reader)

    # Parse species_observed as a JSON object
    for journal in journals:
        journal["species_observed"] = json.loads(journal["species_observed"])

    return journals


# Helper function to write journals to CSV file
def write_journals(journals):
    fieldnames = journals[0].keys()
    with open(CSV_FILE, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(journals)


# Create FastAPI instance
app = FastAPI()


# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    # Add more allowed origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Get all journals with pagination
@app.get("/journals")
def get_all_journals(page: int = Query(1, gt=0), size: int = Query(10, gt=0, le=100)):
    journals_per_page = size
    start_index = (page - 1) * journals_per_page
    end_index = start_index + journals_per_page

    all_journals = read_journals()

    # Perform pagination
    journals = all_journals[start_index:end_index]

    return journals


# Get a specific journal by journal_id
# @app.get("/journals/{journal_id}")
# def get_journal(journal_id: int):
#     # Retrieve the journal with the provided ID
#     journals = read_journals()
#     for journal in journals:
#         if int(journal["id"]) == journal_id:
#             return journal

#     raise HTTPException(status_code=404, detail="Journal not found")


# Search journals by text
@app.get("/journals/search")
def search_journals(search_text: str):
    journals = read_journals()
    search_text = search_text.lower()
    matching_journals = []
    for journal in journals:
        if search_text in journal["place"].lower() or search_text in journal["species_observed"] or search_text in journal["notes"].lower():
            matching_journals.append(journal)
    return matching_journals


# Create a new journal
@app.post("/journals")
def create_journal(journal: Journal):
    journals = read_journals()
    new_journal_id = len(journals) + 1
    journal_dict = journal.dict()
    journal_dict["id"] = new_journal_id
    journals.append(journal_dict)
    write_journals(journals)
    return journal_dict


# Update a journal by ID
@app.put("/journals/{journal_id}")
def update_journal(journal_id: int, updated_journal: Journal):
    journals = read_journals()
    for journal in journals:
        if int(journal["id"]) == journal_id:
            journal.update(updated_journal.dict())
            write_journals(journals)
            return journal
    raise HTTPException(status_code=404, detail="Journal not found")


# Delete a journal by ID
@app.delete("/journals/{journal_id}")
def delete_journal(journal_id: int):
    journals = read_journals()
