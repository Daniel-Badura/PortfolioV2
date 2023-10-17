import React from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import HomeScreen from './screens/HomeScreen';
import ContactScreen from './screens/ContactScreen';
import ProjectScreen from './screens/ProjectScreen';
import InstagramScreen from './screens/InstagramScreen';
import FacebookScreen from './screens/FacebookScreen';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
        <Route path="/projects" element={<ProjectScreen />} />
        <Route path="/facebook" element={<FacebookScreen />} />
        <Route path="/instagram" element={<InstagramScreen />} />
      </Routes>
      <Footer />
    </Router >
  );
}

export default App;
