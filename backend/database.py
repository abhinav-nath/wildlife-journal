from sqlalchemy import JSON, Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./journals.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    place = Column(String)
    species_observed = Column(JSON)
    notes = Column(String)


def create_tables():
    Base.metadata.create_all(bind=engine)
    # create_dummy_journals()


def create_dummy_journals():
    dummy_journals = [
        {
            "date": "2023-06-12",
            "place": "Park",
            "species_observed": {"purple sunbird": 2, "squirrel": 3},
            "notes": "A beautiful day at the park.",
        }
        # Add more dummy journals here
    ]

    db = SessionLocal()
    for journal_data in dummy_journals:
        journal = Journal(**journal_data)
        db.add(journal)
    db.commit()
    db.close()
