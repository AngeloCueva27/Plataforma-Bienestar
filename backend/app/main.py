import traceback
import app.models  # noqa: F401
import app.models.user  # Registra el modelo User en SQLAlchemy

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.rate_limit import limiter
from app.db.base import Base
from app.db.session import engine
from app.routers import (
    auth,
    bienestar,
    counselor,
    estadisticas,
    exportar,
    meta,
    recomendaciones,
    registro,
)

# Genera las tablas en PostgreSQL si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plataforma de Bienestar API",
    description="API para la gestión de autenticación y seguimiento de bienestar",
    version="1.0.0",
)

# Integración del limitador de peticiones (Rate Limiter)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configuración de CORS para el Frontend
origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:80",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handler para capturar errores 500 no controlados sin romper las cabeceras CORS
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Imprime el error detallado en la consola de la terminal
    print("\n--- ERROR INTERNO CAPTURADO (500) ---")
    traceback.print_exc()
    print("-------------------------------------\n")

    # Mantiene las cabeceras CORS en respuestas con error
    request_origin = request.headers.get("origin")
    headers = {}
    if request_origin in origins:
        headers["Access-Control-Allow-Origin"] = request_origin
        headers["Access-Control-Allow-Credentials"] = "true"

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "Ocurrió un error interno en el servidor",
            "detail": str(exc),
        },
        headers=headers,
    )

# Registros de routers
app.include_router(auth.router)
app.include_router(registro.router)
app.include_router(bienestar.router)
app.include_router(meta.router)
app.include_router(estadisticas.router)
app.include_router(recomendaciones.router)
app.include_router(exportar.router)
app.include_router(counselor.router)


@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "status": "ok",
        "message": "API de Bienestar corriendo correctamente"
    }