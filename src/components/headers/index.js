import React, { useState } from 'react';
import './style.css'; // import the CSS file
import logo from "../../assets/logo.png";
import { useDispatch } from 'react-redux';
import { logoutUser } from "../../redux/actions/authActions";

const Header = () => {
  const dispatch = useDispatch();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = () => {
    console.log("logged out");
    dispatch(logoutUser());
  }

  return (
    <header>
      <div className="logo-container">
        <img src={logo} alt="Optiguide Logo" />
      </div>
      <div className="emergency-button-container">
        <button className="emergency-button">
          <i className="fa-solid fa-user-ninja"></i>
        </button>
        <button onClick={handleLogout} className="emergency-button">
          <i className="fa fa-sign-out"></i>
        </button>
      </div>
    </header>
  );
}

export default Header;
