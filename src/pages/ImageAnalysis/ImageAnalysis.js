import React, { useState } from "react";
import axios from "axios";
import "./ImageAnalysis.css"; // CSS 파일 분리

function ImageAnalysisPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [resData, setResData] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
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
      const res = await axios.post("http://141.147.164.232:8080/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResData(res.data);
      setUploadedUrl(`http://141.147.164.232:8080${res.data.file.file_path}`);
      alert("✅ 업로드 성공!");
    } catch (err) {
      console.error(err);
      alert("업로드 실패: 서버 포트(8080) 확인 필요");
    }
  };

  const handleAnalyze = async () => {
    if (!resData?.file?.id) return alert("먼저 이미지를 업로드해야 합니다.");
    setIsAnalyzing(true);

    try {
      const res = await axios.post(`http://141.147.164.232:8080/api/analyze/${resData.file.id}`);
      setKeywords(res.data.keywords);
      alert("분석 완료!");
    } catch (err) {
      console.error("분석 에러:", err);
      alert("AI 분석 실패");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="analysis-container">
      <h2 className="page-title">📸 이미지 분석 스튜디오</h2>
      
      <div className="upload-box">
        <input type="file" id="file-input" onChange={handleFileChange} hidden />
        <label htmlFor="file-input" className="file-label">
          {file ? "파일 변경하기" : "이미지 선택하기"}
        </label>
      </div>
      
      {preview && (
        <div className="preview-section">
          <img src={preview} alt="미리보기" className="preview-img" />
        </div>
      )}

      <div className="action-buttons">
        <button onClick={handleUpload} className="btn-upload">
          1. 서버에 업로드
        </button>

        {uploadedUrl && (
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className={`btn-analyze ${isAnalyzing ? "disabled" : ""}`}
          >
            {isAnalyzing ? "🤖 분석 중..." : "2. AI 분석 실행"}
          </button>
        )}
      </div>

      {keywords.length > 0 && (
        <div className="result-section">
          <h3>🔍 AI 분석 키워드</h3>
          <div className="keyword-list">
            {keywords.map((tag, index) => (
              <span key={index} className="keyword-tag">#{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageAnalysisPage;