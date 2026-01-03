from app.database import engine, Base
from app.models import user, project, scene

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

if __name__ == "__main__":
    create_tables()
