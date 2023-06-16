import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import CreateJournalPage from "./components/CreateJournalPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} exact />
        <Route path="/create-journal" element={<CreateJournalPage />} />
      </Routes>
    </Router>
  );
};

export default App;
