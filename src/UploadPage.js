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
    setResData(null);
    setUploadedUrl("");
    setKeywords([]);
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택해주세요!");

    const formData = new FormData();
    formData.append("image", file);

    try {
      // ✅ [중요] 여기에 :8080을 꼭 붙여야 백엔드가 받습니다!
      const res = await axios.post("http://141.147.164.232:8080/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("업로드 응답:", res.data);
      setResData(res.data);
      setUploadedUrl(`http://141.147.164.232:8080${res.data.file.file_path}`);
      alert("✅ 업로드 성공!");
    } catch (err) {
      console.error(err);
      alert("업로드 실패: 서버 포트(8080) 확인 필요");
    }
  };

  const handleAnalyze = async () => {
    if (!resData || !resData.file || !resData.file.id) {
      return alert("먼저 이미지를 업로드해야 합니다.");
    }

    setIsAnalyzing(true); 

    try {
      const imageId = resData.file.id;
      console.log(`📡 분석 요청 보냄: ID ${imageId}`);

      // ✅ [중요] 여기도 :8080 필수!
      const res = await axios.post(`http://141.147.164.232:8080/api/analyze/${imageId}`);
      
      console.log("🤖 분석 결과:", res.data);
      setKeywords(res.data.keywords); 
      alert("분석 완료!");
      
    } catch (err) {
      console.error("분석 에러:", err);
      alert("AI 분석 실패 (콘솔 로그 확인)");
    } finally {
      setIsAnalyzing(false); 
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px", paddingBottom: "50px" }}>
      <h2>📸 이미지 업로드 & AI 키워드 분석</h2>
      
      <input type="file" onChange={handleFileChange} />
      
      {preview && (
        <div style={{ margin: "20px 0" }}>
          <img src={preview} alt="미리보기" style={{ width: "300px", borderRadius: "10px" }} />
        </div>
      )}

      <button onClick={handleUpload} style={{ padding: "10px 20px", marginRight: "10px" }}>
        1. 서버에 업로드
      </button>

      {uploadedUrl && (
        <div style={{ marginTop: "30px", borderTop: "2px dashed #ccc", paddingTop: "20px" }}>
          <p>✅ 서버 저장 완료!</p>
          
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: isAnalyzing ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {isAnalyzing ? "🤖 AI가 분석 중..." : "2. 🤖 AI 분석 실행"}
          </button>

          {keywords.length > 0 && (
            <div style={{ marginTop: "20px", maxWidth: "400px", margin: "20px auto" }}>
              <h3>🔍 AI 추천 키워드:</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                {keywords.map((tag, index) => (
                  <span key={index} style={{ backgroundColor: "#e3f2fd", color: "#1565c0", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold" }}>
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