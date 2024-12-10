import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Canvas from "./components/canvas";

import NewSession from "./components/config/new-session";

function App() {
  return (
    <Router>
      <div className="App">
        <div
          style={{
            backgroundColor: "#17134a",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <Routes>
              <Route path="/" element={<NewSession />} />
              <Route path="/canvas" element={<Canvas />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
