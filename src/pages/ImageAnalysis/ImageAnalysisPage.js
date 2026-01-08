import React, { useState, useRef } from "react";
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
    
    if (inputRefs.current[index]) {
        inputRefs.current[index].style.width = `${Math.max(value.length * 12, 60)}px`;
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
      setStep(3); // 저장 완료 상태로 변경
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
          <h3>
             {step === 3 ? "✅ 저장 완료된 해시태그" : "✏️ 해시태그 편집"}
          </h3>
          <p className="sub-text">
            {step === 3 
              ? "데이터베이스에 안전하게 저장되었습니다." 
              : "AI 추천 태그입니다. 자유롭게 수정하고 추가하세요!"}
          </p>

          <div className="keyword-edit-list">
            {keywords.map((word, index) => (
              <div key={index} className="keyword-input-group">
                <span className="hash-mark">#</span>
                <input 
                  ref={el => inputRefs.current[index] = el}
                  type="text" 
                  value={word}
                  // ✅ [수정] 저장이 완료되면(step===3) 수정 못하게 막음
                  disabled={step === 3}
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  className="keyword-input"
                  style={{ width: `${Math.max(word.length * 12, 60)}px` }}
                />
                
                {/* ✅ [수정] 저장이 완료되면(step===3) 삭제 버튼(x) 숨김 */}
                {step !== 3 && (
                  <button onClick={() => handleDeleteKeyword(index)} className="btn-delete" title="삭제">
                    ×
                  </button>
                )}
              </div>
            ))}

            {/* ✅ [요청하신 부분] 저장이 완료되면 '추가' 버튼 숨김 */}
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
            <div style={{marginTop: '20px'}}>
               <p style={{color: '#2ecc71', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px'}}>
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