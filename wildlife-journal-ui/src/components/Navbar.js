import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand navbar-light bg-light mb-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          Home
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
