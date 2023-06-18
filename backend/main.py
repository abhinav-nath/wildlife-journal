from sqlalchemy import or_
import json
from fastapi import FastAPI, HTTPException, Query
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
def get_all_journals(page: int = Query(1, gt=0), size: int = Query(10, gt=0, le=100)):
    db = SessionLocal()
    start_index = (page - 1) * size
    end_index = start_index + size

    journals = db.query(Journal).offset(start_index).limit(size).all()
    db.close()

    return journals


@app.get("/journals")
def get_journal(journal_id: int = Query(..., alias="journal_id")):
    print("inside get_journal endpoint")
    db = SessionLocal()
    journal = db.query(Journal).filter(Journal.id == journal_id).first()
    db.close()

    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    return journal


@app.get("/journals/search")
def search_journals(search_text: str = Query(..., alias="search_text")):
    db = SessionLocal()
    search_text = search_text.lower()

    matching_journals = (
        db.query(Journal)
        .filter(
            or_(
                func.lower(Journal.place).like(f"%{search_text}%"),
                func.lower(Journal.notes).like(f"%{search_text}%"),
                func.lower(Journal.species_observed).like(f"%{search_text}%"),
            )
        )
        .all()
    )

    db.close()

    return matching_journals


@app.post("/journals")
def create_journal(journal: JournalCreate):
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
    db = SessionLocal()
    journal = db.query(Journal).filter(Journal.id == journal_id).first()

    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    for field, value in updated_journal.dict(exclude_unset=True).items():
        setattr(journal, field, value)

    db.commit()
    db.close()

    return journal


@app.delete("/journals/{journal_id}")
def delete_journal(journal_id: int):
    db = SessionLocal()
    journal = db.query(Journal).filter(Journal.id == journal_id).first()

    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")

    db.delete(journal)
    db.commit()
    db.close()

    return {"message": "Journal deleted successfully"}
