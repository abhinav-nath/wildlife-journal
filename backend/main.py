import os
import csv
import json
from sqlalchemy import or_
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from typing import List, Dict, Optional

from pydantic import BaseModel
from database import SessionLocal, create_tables, Journal

app = FastAPI()

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

create_tables()


class JournalCreate(BaseModel):
    date: str
    place: str
    species_observed: Dict[str, int]
    notes: Optional[str]


class JournalUpdate(BaseModel):
    date: Optional[str]
    place: Optional[str]
    species_observed: Optional[Dict[str, int]]
    notes: Optional[str]


@app.get("/journals")
def get_journals(page: int = Query(1, gt=0), size: int = Query(10, gt=0, le=100), search_text: Optional[str] = Query(None, alias="search_text")):
    print("inside get_journals endpoint")

    db = SessionLocal()
    start_index = (page - 1) * size
    end_index = start_index + size

    if search_text:
        matching_journals = (
            db.query(Journal)
            .filter(
                or_(
                    func.lower(Journal.place).like(f"%{search_text}%"),
                    func.lower(Journal.notes).like(f"%{search_text}%"),
                    func.lower(Journal.species_observed).like(
                        f"%{search_text}%"),
                )
            )
            .offset(start_index)
            .limit(size)
            .all()
        )
        total_count = (
            db.query(func.count(Journal.id))
            .filter(
                or_(
                    func.lower(Journal.place).like(f"%{search_text}%"),
                    func.lower(Journal.notes).like(f"%{search_text}%"),
                    func.lower(Journal.species_observed).like(
                        f"%{search_text}%"),
                )
            )
            .scalar()
        )
    else:
        matching_journals = db.query(Journal).offset(
            start_index).limit(size).all()
        total_count = db.query(func.count(Journal.id)).scalar()

    db.close()

    return {"journals": matching_journals, "totalCount": total_count}


@app.get("/journals/{journal_id}")
def get_journal(journal_id: int = Path(..., title="Journal ID")):
    print("inside get_journal endpoint with journal_id: ", journal_id)

    db = SessionLocal()
    journal = db.query(Journal).filter(Journal.id == journal_id).first()
    db.close()

    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    return journal


@app.post("/journals")
def create_journal(journal: JournalCreate):
    print("inside create_journal endpoint")

    db = SessionLocal()
    new_journal = Journal(
        date=journal.date,
        place=journal.place,
        species_observed=journal.species_observed,
        notes=journal.notes,
    )
    db.add(new_journal)
    db.commit()
    db.refresh(new_journal)
    db.close()

    return new_journal


@app.put("/journals/{journal_id}")
def update_journal(journal_id: int, updated_journal: JournalUpdate):
    print("inside update_journal endpoint with journal_id: ", journal_id)

    db = SessionLocal()
    journal = db.query(Journal).filter(Journal.id == journal_id).first()

    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    for field, value in updated_journal.dict(exclude_unset=True).items():
        setattr(journal, field, value)

    db.commit()
    db.close()

    return journal


@app.delete("/journals")
def delete_journal(journal_id: Optional[int] = Query(None, title="Journal ID")):
    print("inside delete_journal endpoint")
    db = SessionLocal()

    if journal_id is not None:
        journal = db.query(Journal).filter(Journal.id == journal_id).first()

        if not journal:
            raise HTTPException(status_code=404, detail="Journal not found")

        db.delete(journal)
    else:
        db.query(Journal).delete()

    db.commit()
    db.close()

    return {"message": "Journal(s) deleted successfully"}


@app.post("/import")
def import_from_csv():
    print("inside import_from_csv endpoint")

    db = SessionLocal()

    # Define the CSV file path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "wildlife_journals.csv")

    # Check if the CSV file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    # Read records from the CSV file and validate the format
    with open(file_path, mode="r") as file:
        reader = csv.DictReader(file)
        journals = []
        for row in reader:
            try:
                journal = Journal(
                    id=int(row["id"]),
                    date=row["date"],
                    place=row["place"],
                    species_observed=json.loads(row["species_observed"]),
                    notes=row["notes"]
                )
                journals.append(journal)
            except (KeyError, ValueError):
                raise HTTPException(
                    status_code=400, detail="Invalid CSV format")

    # Delete all existing records from the database
    db.query(Journal).delete()

    # Insert new records into the database
    db.bulk_save_objects(journals)
    db.commit()
    db.close()

    return {"message": f"Imported {len(journals)} records from {file_path}"}


@app.get("/export")
def export_to_csv():
    print("inside export_to_csv endpoint")

    db = SessionLocal()
    journals = db.query(Journal).all()
    db.close()

    # Define the CSV file path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "wildlife_journals.csv")

    # Write records to the CSV file
    with open(file_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["id", "date", "place", "species_observed", "notes"])
        for journal in journals:
            writer.writerow([
                journal.id,
                journal.date,
                journal.place,
                json.dumps(journal.species_observed),
                journal.notes,
            ])

    return {"message": f"Exported all records to {file_path}"}
