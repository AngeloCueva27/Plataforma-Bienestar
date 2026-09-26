# app/db/base.py
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Importar todos los modelos para registrar sus relaciones en SQLAlchemy
from app.models.user import User
from app.models.bienestar import RegistroBienestar
from app.models.meta import MetaBienestar
from app.models.ai_models import RecomendacionIA, ConversacionChat, MensajeChat, AlertaBienestar, AuditoriaIA