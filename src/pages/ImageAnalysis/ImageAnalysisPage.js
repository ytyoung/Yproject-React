import React, { useState } from "react";
import axios from "axios";
import "./ImageAnalysisPage.css";

function ImageAnalysisPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedId, setUploadedId] = useState(null); // DB ID 저장
  const [keywords, setKeywords] = useState([]); // AI가 준 + 내가 수정한 키워드들
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0); // 0:선택전, 1:업로드완료, 2:분석완료(수정모드), 3:저장완료

  // 1. 파일 선택 시 -> 바로 자동 업로드 실행
  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // 미리보기 세팅
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setKeywords([]); // 기존 키워드 초기화
    setStep(0);

    // 🚀 바로 서버로 업로드!
    await autoUpload(selected);
  };

  // 자동 업로드 함수
  const autoUpload = async (selectedFile) => {
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      console.log("📤 자동 업로드 시작...");
      const res = await axios.post("http://141.147.164.232:8080/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setUploadedId(res.data.file.id); // DB ID 저장 (분석할 때 씀)
      setStep(1); // 단계 이동
      alert("✅ 이미지가 클라우드에 안전하게 저장되었습니다. 이제 AI 분석을 해보세요!");
    } catch (err) {
      console.error(err);
      alert("업로드 실패! 서버를 확인해주세요.");
    }
  };

  // 2. AI 분석 실행 (저장 안 하고 가져오기만 함)
  const handleAnalyze = async () => {
    if (!uploadedId) return alert("이미지 ID가 없습니다. 다시 업로드해주세요.");
    setIsAnalyzing(true);

    try {
      const res = await axios.post(`http://141.147.164.232:8080/api/analyze/${uploadedId}`);
      setKeywords(res.data.keywords); // 받아온 키워드를 state에 저장
      setStep(2); // 수정 모드로 진입
    } catch (err) {
      console.error("분석 에러:", err);
      alert("AI 분석 실패");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. 키워드 개별 수정 기능
  const handleKeywordChange = (index, value) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  // 4. 키워드 삭제 기능
  const handleDeleteKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
  };

  // 5. 키워드 추가 기능
  const handleAddKeyword = () => {
    setKeywords([...keywords, "새키워드"]);
  };

  // 6. 최종 DB 저장
  const handleFinalSave = async () => {
    try {
      await axios.post(`http://141.147.164.232:8080/api/analyze/save/${uploadedId}`, {
        keywords: keywords
      });
      alert("🎉 키워드가 최종 저장되었습니다!");
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("저장 실패");
    }
  };

  return (
    <div className="analysis-container">
      <h2 className="page-title">📸 AI 분석 & 키워드 편집</h2>
      
      {/* 1. 이미지 선택 영역 */}
      <div className="upload-box">
        <input type="file" id="file-input" onChange={handleFileChange} hidden />
        <label htmlFor="file-input" className="file-label">
          {file ? "🔄 다른 사진 선택 (자동 업로드)" : "➕ 사진 선택하기"}
        </label>
      </div>
      
      {preview && (
        <div className="preview-section">
          <img src={preview} alt="미리보기" className="preview-img" />
        </div>
      )}

      {/* 2. 분석 버튼 (업로드 완료 시 보임) */}
      {step === 1 && (
        <button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="btn-analyze"
        >
          {isAnalyzing ? "🤖 AI가 사진을 뚫어지게 보는 중..." : "⚡ AI 분석 실행"}
        </button>
      )}

      {/* 3. 키워드 수정 영역 (분석 완료 시 보임) */}
      {step >= 2 && (
        <div className="edit-section">
          <h3>✏️ 키워드를 확인하고 수정하세요</h3>
          <p className="sub-text">AI가 제안한 태그입니다. 마음에 안 들면 고치세요!</p>

          <div className="keyword-edit-list">
            {keywords.map((word, index) => (
              <div key={index} className="keyword-input-group">
                <input 
                  type="text" 
                  value={word} 
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  className="keyword-input"
                />
                <button onClick={() => handleDeleteKeyword(index)} className="btn-delete">✖</button>
              </div>
            ))}
            <button onClick={handleAddKeyword} className="btn-add">+ 태그 추가</button>
          </div>

          {step === 2 && (
            <button onClick={handleFinalSave} className="btn-save-final">
              💾 이대로 저장하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageAnalysisPage;