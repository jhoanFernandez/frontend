import React from "react";
import { useNavigate } from "react-router-dom";
import "../ui/css/new-sesion.css"; // Archivo CSS

export default function NewSession() {
  const navigate = useNavigate();

  const createNewSession = async () => {
    try {
      const response = await fetch("http://localhost:4000/new-session");
      if (!response.ok) {
        throw new Error("No se pudo establecer conexión con el servidor");
      }
      const data = await response.json();
      navigate(`/canvas?sessionId=${data.sessionId}`);
    } catch (error) {
      console.error("Error al crear la sesión:", error);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Bienvenido a SharedScreen</h1>
        <p>
          Comparte tu pantalla y colabora en tiempo real. ¡Haz clic en el botón
          para iniciar una nueva sesión!
        </p>
      </header>
      <button className="create-button" onClick={createNewSession}>
        Crear Nueva Sesión
      </button>
      <footer>
        <p>© 2024 SharedScreen. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
