import React, { useState } from "react";
import axios from "axios";
import "./KeywordSearchPage.css";

function KeywordSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
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

  const openModal = (img) => { setSelectedImg(img); };
  const closeModal = () => { setSelectedImg(null); };

  // ✅ [핵심 기능 변경] 다운로드 또는 공유하기
  const handleDownloadOrShare = async (imgUrl, originalName) => {
    try {
      // 1. 이미지 데이터를 가져와서 파일 객체로 변환
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const file = new File([blob], originalName || "image.jpg", { type: blob.type });

      // 2. 모바일 공유 기능(navigator.share) 지원 여부 확인
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'PhotoSense 이미지 다운로드',
            text: '이미지를 갤러리에 저장하려면 [이미지 저장]을 선택하세요.',
          });
          return; // 공유 창이 뜨면 여기서 종료
        } catch (err) {
          if (err.name !== "AbortError") console.error("공유 실패:", err);
          // 공유하다가 취소했거나 에러나면 아래 다운로드 로직으로 넘어감 (fallback)
        }
      }

      // 3. PC거나 공유 기능이 없으면 기존 방식대로 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = originalName || "download_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("다운로드/공유 실패:", err);
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
        <button onClick={handleSearch} className="search-btn">검색</button>
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
            <div className="hover-overlay"><span>🔍 크게 보기</span></div>
          </div>
        ))}
      </div>

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
                
                {/* ✅ 버튼 기능 변경 및 힌트 메시지 추가 */}
                <button 
                  className="btn-download"
                  onClick={() => handleDownloadOrShare(getImageUrl(selectedImg.file_path), selectedImg.original_name)}
                >
                  💾 저장 / 공유하기
                </button>
                <p className="mobile-hint">
                  (모바일에서는 이미지를 꾹 눌러서 저장할 수도 있어요!)
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeywordSearchPage;