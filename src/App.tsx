import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LP from "./LP";
import "bootstrap/dist/css/bootstrap.min.css";
import Stats from "./Stats";
import Login from "./Login";

function App() {
  const base = process.env.PUBLIC_URL;
  return (
    <div className="App">
      <Router basename={base}>
        <Routes>
          <Route path="/" element={<LP />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
