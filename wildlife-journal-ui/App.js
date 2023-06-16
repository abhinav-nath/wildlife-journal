import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import CreateJournalPage from "./components/CreateJournalPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" component={HomePage} />
        <Route path="/create-journal" component={CreateJournalPage} />
      </Routes>
    </Router>
  );
};

export default App;
