import React from "react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import './Header.css';

export default function Header() {
  return (
    <div className="header">
      <ul className="navbar">

        <div className="nav-left">
          <li className="nav-item nav-item-left">
            <span className="nav-link">1</span>
          </li>
        </div>

        <div className="nav-right">
          <li className="nav-item">
            <span className="nav-link">2</span>
          </li>
        </div>

      </ul>
    </div>
  );
}
