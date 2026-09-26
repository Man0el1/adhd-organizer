import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.js";
import ModuleList from "./pages/ModuleList.js";
import Register from "./pages/Register.js";
import Login from "./pages/Login.js"
import Main from "./pages/Main.js"
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import Page404 from "./pages/Page404.js";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Header/>
            <Home/>
            <Footer/>
          </>
        }
        />

        <Route path="/module-list" element={
          <>
            <Header/>
            <ModuleList/>
          </>
        }
        />

        <Route path="/register" element={
          <>
            <Header/>
            <Register/>
          </>
        }
        />

        <Route path="/login" element={
          <>
            <Header/>
            <Login/>
          </>
        }
        />

        <Route path="/main" element={<Main/>}/>
        <Route path="*" element={
          <>
            <Header/>
            <Page404/>
          </>
        }
        />
      </Routes>
    </Router>
  );
}
