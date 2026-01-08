import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import ImageAnalysisPage from "./pages/ImageAnalysis/ImageAnalysisPage";
import KeywordSearchPage from "./pages/KeywordSearch/KeywordSearchPage";
import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="App">
        {/* 상단바는 항상 표시됨 */}
        <Navbar />
        
        {/* URL에 따라 내용이 바뀌는 부분 */}
        <div className="content">
          <Routes>
            <Route path="/" element={<ImageAnalysisPage />} />
            <Route path="/search" element={<KeywordSearchPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;