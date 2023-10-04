import React from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import HomeScreen from './screens/HomeScreen';
import ContactScreen from './screens/ContactScreen';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
      </Routes>
      <Footer />
    </Router >
  );
}

export default App;
