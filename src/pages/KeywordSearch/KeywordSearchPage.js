import React, { useState } from "react";
import axios from "axios";
import "./KeywordSearchPage.css";

function KeywordSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // ✅ [추가] 선택된 이미지(팝업용) 상태
  const [selectedImg, setSelectedImg] = useState(null);

  const handleSearch = async (e) => {
    if (e.key && e.key !== "Enter") return;
    if (!query.trim()) return alert("검색어를 입력하세요!");

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const res = await axios.get(`http://141.147.164.232:8080/api/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error("검색 실패:", err);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    const filename = path.split("/").pop(); 
    return `http://141.147.164.232:8080/uploads/${filename}`;
  };

  // ✅ [추가] 이미지 클릭 시 모달 열기
  const openModal = (img) => {
    setSelectedImg(img);
  };

  // ✅ [추가] 모달 닫기
  const closeModal = () => {
    setSelectedImg(null);
  };

  // ✅ [추가] 이미지 다운로드 함수
  const handleDownload = async (imgUrl, originalName) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = originalName || "download_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("다운로드 실패:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="search-container">
      <h2 className="search-title">🔍 키워드 검색</h2>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="예: 고양이, 팝업, 헌터원..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-btn">
          검색
        </button>
      </div>

      {loading && <p className="loading-text">데이터베이스를 뒤지는 중...</p>}

      <div className="results-grid">
        {searched && !loading && results.length === 0 && (
          <p className="no-result">😥 '{query}'에 대한 사진이 없습니다.</p>
        )}

        {results.map((img) => (
          <div key={img.id} className="image-card" onClick={() => openModal(img)}>
            <img 
              src={getImageUrl(img.file_path)} 
              alt={img.original_name} 
              className="result-img" 
            />
            {/* 마우스 올리면 돋보기 아이콘 효과 */}
            <div className="hover-overlay">
                <span>🔍 크게 보기</span>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ [추가] 이미지 상세 모달 (Popup) */}
      {selectedImg && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            
            <img 
              src={getImageUrl(selectedImg.file_path)} 
              alt="원본" 
              className="modal-img" 
            />
            
            <div className="modal-footer">
                <span className="file-name">{selectedImg.original_name}</span>
                <button 
                  className="btn-download"
                  onClick={() => handleDownload(getImageUrl(selectedImg.file_path), selectedImg.original_name)}
                >
                  💾 내 컴퓨터에 저장
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeywordSearchPage;