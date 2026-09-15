CREATE TYPE rol_enum AS ENUM ('estudiante', 'especialista', 'administrador');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    ciclo INT CHECK (ciclo >= 1 AND ciclo <= 10),
    rol rol_enum DEFAULT 'estudiante' NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registros_bienestar (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    horas_sueno FLOAT NOT NULL,
    actividad_fisica_tipo VARCHAR(100),
    actividad_fisica_minutos INT DEFAULT 0,
    alimentacion_resumen TEXT,
    nivel_estres INT CHECK (nivel_estres BETWEEN 1 AND 10) NOT NULL,
    nivel_animo INT CHECK (nivel_animo BETWEEN 1 AND 10) NOT NULL,
    emociones VARCHAR(255),
    horas_estudio FLOAT NOT NULL,
    nivel_concentracion INT CHECK (nivel_concentracion BETWEEN 1 AND 10) NOT NULL,
    rendimiento_percibido INT CHECK (rendimiento_percibido BETWEEN 1 AND 10) NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_bienestar_fecha ON registros_bienestar(fecha);
CREATE INDEX idx_bienestar_usuario ON registros_bienestar(usuario_id);