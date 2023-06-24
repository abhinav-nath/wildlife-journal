import csv
import json
import os
from contextlib import contextmanager
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import func, or_

from database import Journal, SessionLocal, create_tables

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


@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


@app.get("/journals")
def get_journals(
    page: int = Query(1, gt=0),
    size: int = Query(10, gt=0, le=100),
    search_text: Optional[str] = Query(None, alias="search_text"),
):
    """Get journals with pagination and search."""
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
                    func.lower(Journal.species_observed).like(f"%{search_text}%"),
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
                    func.lower(Journal.species_observed).like(f"%{search_text}%"),
                )
            )
            .scalar()
        )
    else:
        matching_journals = db.query(Journal).offset(start_index).limit(size).all()
        total_count = db.query(func.count(Journal.id)).scalar()

    db.close()

    return {"journals": matching_journals, "totalCount": total_count}


@app.get("/journals/{journal_id}")
def get_journal(journal_id: int = Path(..., title="Journal ID")):
    """Get a journal by ID."""
    print("inside get_journal endpoint with journal_id:", journal_id)

    db = SessionLocal()
    journal = db.query(Journal).filter(Journal.id == journal_id).first()
    db.close()

    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    return journal


@app.post("/journals")
def create_journal(journal: JournalCreate):
    """Create a new journal."""
    with session_scope() as session:
        db_journal = Journal(**journal.dict())
        session.add(db_journal)
        session.commit()

        return {"message": "Journal created successfully", "id": db_journal.id}


@app.put("/journals/{journal_id}")
def update_journal(journal_id: int, journal: JournalUpdate):
    """Update a journal."""
    print("inside update_journal endpoint with journal_id:", journal_id)
    with session_scope() as session:
        db_journal = session.query(Journal).filter(Journal.id == journal_id).first()
        if db_journal is None:
            raise HTTPException(status_code=404, detail="Journal not found")

        for field, value in journal.dict(exclude_unset=True).items():
            setattr(db_journal, field, value)

        session.add(db_journal)
        session.commit()

        return {"message": "Journal updated successfully"}


@app.delete("/journals/{journal_id}")
def delete_journal(journal_id: int):
    """Delete a journal."""
    with session_scope() as session:
        db_journal = session.query(Journal).filter(Journal.id == journal_id).first()
        if db_journal is None:
            raise HTTPException(status_code=404, detail="Journal not found")

        session.delete(db_journal)
        session.commit()

        return {"message": "Journal deleted successfully"}


@app.post("/import")
def import_from_csv():
    """Import journals from a CSV file."""
    print("inside import_from_csv endpoint")

    try:
        journals = read_journals_from_csv("wildlife_journals.csv")
    except (KeyError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid CSV format")

    with session_scope() as session:
        delete_all_journals(session)
        session.bulk_save_objects(journals)

    return {"message": "Journal(s) imported successfully"}


@app.get("/export")
def export_to_csv():
    """Export all journals to a CSV file."""
    print("inside export_to_csv endpoint")
    with session_scope() as session:
        journals = session.query(Journal).all()

        if not journals:
            raise HTTPException(status_code=404, detail="No journals found")

        file_path = "wildlife_journals_export.csv"
        with open(file_path, mode="w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["id", "date", "place", "species_observed", "notes"])
            for journal in journals:
                writer.writerow(
                    [
                        journal.id,
                        journal.date,
                        journal.place,
                        json.dumps(journal.species_observed),
                        journal.notes,
                    ]
                )

        return FileResponse(file_path, filename="wildlife_journals_export.csv")


def read_journals_from_csv(file_path):
    """Read records from the CSV file and return a list of Journal objects."""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    with open(file_path, mode="r") as file:
        reader = csv.DictReader(file)
        journals = [
            Journal(
                id=int(row["id"]),
                date=row["date"],
                place=row["place"],
                species_observed=json.loads(row["species_observed"]),
                notes=row["notes"],
            )
            for row in reader
        ]

    return journals


def delete_all_journals(db):
    """Delete all existing Journal records from the database."""
    db.query(Journal).delete()
