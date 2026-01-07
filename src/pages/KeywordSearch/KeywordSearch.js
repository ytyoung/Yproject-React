import React, { useState } from "react";
import axios from "axios";
import "./KeywordSearch.css"; // 스타일 파일 (다음 단계에서 만듦)

function KeywordSearchPage() {
  const [query, setQuery] = useState(""); // 검색어
  const [results, setResults] = useState([]); // 검색 결과(사진들)
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // 검색을 시도했는지 여부

  const handleSearch = async (e) => {
    // 엔터키를 눌렀거나 버튼을 클릭했을 때 실행
    if (e.key && e.key !== "Enter") return;
    if (!query.trim()) return alert("검색어를 입력하세요!");

    setLoading(true);
    setSearched(true);
    setResults([]); // 기존 결과 초기화

    try {
      // ✅ 백엔드 검색 API 호출
      const res = await axios.get(`http://141.147.164.232:8080/api/search?q=${query}`);
      setResults(res.data);
      console.log("검색 결과:", res.data);
    } catch (err) {
      console.error("검색 실패:", err);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이미지 경로 가공 함수 (서버 경로 -> URL)
  const getImageUrl = (path) => {
    // DB에 /home/opc/... 전체 경로가 있다면 파일명만 떼서 URL로 만듦
    const filename = path.split("/").pop(); 
    return `http://141.147.164.232:8080/uploads/${filename}`;
  };

  return (
    <div className="search-container">
      <h2 className="search-title">🔍 키워드 검색</h2>
      
      {/* 검색창 영역 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="예: 고양이, 팝업, 헌터원..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch} // 엔터키 지원
          className="search-input"
        />
        <button onClick={handleSearch} className="search-btn">
          검색
        </button>
      </div>

      {/* 로딩 표시 */}
      {loading && <p className="loading-text">데이터베이스를 뒤지는 중...</p>}

      {/* 결과 영역 */}
      <div className="results-grid">
        {searched && !loading && results.length === 0 && (
          <p className="no-result">😥 '{query}'에 대한 사진이 없습니다.</p>
        )}

        {results.map((img) => (
          <div key={img.id} className="image-card">
            <img 
              src={getImageUrl(img.file_path)} 
              alt={img.original_name} 
              className="result-img" 
            />
            {/* 마우스 올리면 파일명 보이게 하거나, 나중에 상세정보 기능 추가 가능 */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KeywordSearchPage;