import React, { useState } from "react";
import axios from "axios";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [resData, setResData] = useState(null);
  
  // ✅ AI 분석 결과와 로딩 상태 관리
  const [keywords, setKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    // 새 파일 선택 시 기존 결과 초기화
    setResData(null);
    setUploadedUrl("");
    setKeywords([]);
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택해주세요!");

    const formData = new FormData();
    formData.append("image", file);

    try {
      // ✅ [수정 1] 포트 번호 8080 추가 (중요!)
      const res = await axios.post("http://141.147.164.232:8080/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("업로드 응답:", res.data);
      setResData(res.data);
      
      // 서버에서 주는 파일 경로에 포트 번호 붙이기
      setUploadedUrl(`http://141.147.164.232:8080${res.data.file.file_path}`);
      alert("✅ 업로드 성공! 이제 AI 분석 버튼을 눌러보세요.");
    } catch (err) {
      console.error(err);
      alert("업로드 실패: 서버가 켜져 있는지, 포트(8080)가 맞는지 확인하세요.");
    }
  };

  // ✅ [수정 2] AI 분석 요청 함수 추가
  const handleAnalyze = async () => {
    if (!resData || !resData.file || !resData.file.id) {
      return alert("먼저 이미지를 업로드해야 합니다.");
    }

    setIsAnalyzing(true); // 로딩 시작

    try {
      const imageId = resData.file.id;
      console.log(`📡 분석 요청 보냄: ID ${imageId}`);

      // ✅ [수정 3] 분석 API 호출 (포트 8080 필수)
      const res = await axios.post(`http://141.147.164.232:8080/api/analyze/${imageId}`);
      
      console.log("🤖 분석 결과:", res.data);
      setKeywords(res.data.keywords); // 결과 저장
      alert("분석 완료!");
      
    } catch (err) {
      console.error("분석 에러:", err);
      alert("AI 분석에 실패했습니다. (서버 로그를 확인하세요)");
    } finally {
      setIsAnalyzing(false); // 로딩 끝
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px", paddingBottom: "50px" }}>
      <h2>📸 이미지 업로드 & AI 키워드 분석</h2>
      
      <input type="file" onChange={handleFileChange} />
      
      {preview && (
        <div style={{ margin: "20px 0" }}>
          <img 
            src={preview} 
            alt="미리보기" 
            style={{ width: "300px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }} 
          />
        </div>
      )}

      {/* 업로드 버튼 */}
      <button 
        onClick={handleUpload} 
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginRight: "10px" }}
      >
        1. 서버에 업로드
      </button>

      {/* 업로드 완료 후 분석 버튼 표시 */}
      {uploadedUrl && (
        <div style={{ marginTop: "30px", borderTop: "2px dashed #ccc", paddingTop: "20px" }}>
          <p>✅ 서버 저장 완료!</p>
          
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            style={{ 
              padding: "10px 20px", 
              fontSize: "16px", 
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              backgroundColor: isAnalyzing ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px"
            }}
          >
            {isAnalyzing ? "🤖 AI가 분석 중..." : "2. 🤖 AI 분석 실행 (키워드 추출)"}
          </button>

          {/* 키워드 결과 보여주기 */}
          {keywords.length > 0 && (
            <div style={{ marginTop: "20px", maxWidth: "400px", margin: "20px auto", textAlign: "left" }}>
              <h3>🔍 추출된 키워드:</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {keywords.map((tag, index) => (
                  <span key={index} style={{ 
                    backgroundColor: "#e3f2fd", 
                    color: "#1565c0", 
                    padding: "8px 15px", 
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadPage;