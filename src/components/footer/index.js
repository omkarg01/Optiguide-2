import React, { useState } from "react";
import "./style.css"; // import the CSS file

const Footer = () => {
  const [activeButton, setActiveButton] = useState("Home");

  const handleClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  return (
    <footer>
      <div className="footer-buttons">
        <button
          className={activeButton === "Home" ? "active" : ""}
          onClick={() => handleClick("Home")}
        >
          <i className="fas fa-home"></i>
          <span>Home</span>
        </button>
        <button
          className={activeButton === "Consultation" ? "active" : ""}
          onClick={() => handleClick("Consultation")}
        >
          <i className="fas fa-user-md"></i>
          <span>Consultation</span>
        </button>
        <button
          className={activeButton === "Community" ? "active" : ""}
          onClick={() => handleClick("Community")}
        >
          <i className="fas fa-users"></i>
          <span>Community</span>
        </button>
        <button
          className={activeButton === "Profile" ? "active" : ""}
          onClick={() => handleClick("Profile")}
        >
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
