import React, { useState, useRef, useEffect } from "react"; // useEffect 추가
import axios from "axios";
import "./ImageAnalysisPage.css";

function ImageAnalysisPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedId, setUploadedId] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  
  const inputRefs = useRef([]);

  // ✅ [추가] 너비 계산 함수 (한글은 폭이 넓으므로 넉넉하게 잡음)
  const calculateWidth = (text) => {
    // 기본 40px + 글자당 15px (한글 깨짐 방지)
    return Math.max(text.length * 15 + 20, 60); 
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setKeywords([]);
    setStep(0);
    await autoUpload(selected);
  };

  const autoUpload = async (selectedFile) => {
    const formData = new FormData();
    formData.append("image", selectedFile);
    try {
      const res = await axios.post("http://141.147.164.232:8080/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedId(res.data.file.id);
      setStep(1);
      alert("✅ 이미지 업로드 완료! AI 분석을 실행해주세요.");
    } catch (err) {
      console.error(err);
      alert("업로드 실패! 서버 상태를 확인해주세요.");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedId) return;
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`http://141.147.164.232:8080/api/analyze/${uploadedId}`);
      setKeywords(res.data.keywords);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("AI 분석 실패");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeywordChange = (index, value) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
    
    // ✅ 입력할 때 실시간으로 너비 조절
    if (inputRefs.current[index]) {
        inputRefs.current[index].style.width = `${calculateWidth(value)}px`;
    }
  };

  const handleDeleteKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
  };

  const handleAddKeyword = () => {
    setKeywords([...keywords, ""]);
  };

  const handleFinalSave = async () => {
    const validKeywords = keywords.filter(word => word.trim() !== "");
    if (validKeywords.length === 0) {
      alert("⚠️ 저장할 키워드가 없습니다!\n최소 한 개 이상의 태그를 입력해주세요.");
      return;
    }

    try {
      await axios.post(`http://141.147.164.232:8080/api/analyze/save/${uploadedId}`, {
        keywords: validKeywords
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("저장 실패: 서버 오류");
    }
  };

  return (
    <div className="analysis-container">
      <h2 className="page-title">📸 AI 분석 스튜디오</h2>
      
      <div className="upload-box">
        <input type="file" id="file-input" onChange={handleFileChange} hidden />
        <label htmlFor="file-input" className="file-label">
          {file ? "🔄 사진 변경 (자동 업로드)" : "➕ 사진 선택하기"}
        </label>
      </div>
      
      {preview && (
        <div className="preview-section">
          <img src={preview} alt="미리보기" className="preview-img" />
        </div>
      )}

      {step === 1 && (
        <button onClick={handleAnalyze} disabled={isAnalyzing} className="btn-analyze">
          {isAnalyzing ? "✨ AI가 열심히 분석 중..." : "⚡ AI 분석 실행하기"}
        </button>
      )}

      {step >= 2 && (
        <div className="edit-section">
          <h3>{step === 3 ? "✅ 저장 완료된 해시태그" : "✏️ 해시태그 편집"}</h3>
          <p className="sub-text">
            {step === 3 
              ? "데이터베이스에 안전하게 저장되었습니다." 
              : "AI 추천 태그입니다. 자유롭게 수정하고 추가하세요!"}
          </p>

          <div className="keyword-edit-list">
            {keywords.map((word, index) => {
              // ✅ [핵심 변경] 저장 완료(step 3)면 'span'으로, 편집 중이면 'input'으로 보여줌
              if (step === 3) {
                return (
                  <span key={index} className="keyword-tag-final">
                    <span className="hash-mark-final">#</span>
                    {word}
                  </span>
                );
              } else {
                return (
                  <div key={index} className="keyword-input-group">
                    <span className="hash-mark">#</span>
                    <input 
                      ref={el => {
                        inputRefs.current[index] = el;
                        // 초기 렌더링 시에도 너비 맞춤
                        if (el) el.style.width = `${calculateWidth(word)}px`;
                      }}
                      type="text" 
                      value={word}
                      onChange={(e) => handleKeywordChange(index, e.target.value)}
                      className="keyword-input"
                    />
                    <button onClick={() => handleDeleteKeyword(index)} className="btn-delete" title="삭제">
                      ×
                    </button>
                  </div>
                );
              }
            })}

            {step !== 3 && (
               <button onClick={handleAddKeyword} className="btn-add">+ 추가</button>
            )}
          </div>

          {step === 2 && (
            <button onClick={handleFinalSave} className="btn-save-final">
              💾 이대로 저장하기
            </button>
          )}
          
          {step === 3 && (
            <div style={{marginTop: '30px'}}>
               <p style={{color: '#2ecc71', fontWeight: '800', fontSize: '1.3rem'}}>
                 🎉 저장이 완료되었습니다!
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageAnalysisPage;