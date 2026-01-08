import React, { useState, useRef } from "react"; // useRef 추가 (입력창 너비 자동조절용)
import axios from "axios";
import "./ImageAnalysisPage.css";

function ImageAnalysisPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedId, setUploadedId] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  
  // 키워드 입력창 너비 자동 조절을 위한 ref 배열
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
    
    // 입력된 글자 수에 맞춰 input 너비 자동 조절 (UX 개선)
    if (inputRefs.current[index]) {
        inputRefs.current[index].style.width = `${Math.max(value.length * 12, 60)}px`;
    }
  };

  const handleDeleteKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
  };

  const handleAddKeyword = () => {
    setKeywords([...keywords, ""]); // 빈 입력창 추가
  };

  // ✅ [핵심] 최종 저장 전 밸리데이션 체크!
  const handleFinalSave = async () => {
    // 1. 빈 칸("")이나 공백만 있는 키워드는 걸러냅니다.
    const validKeywords = keywords.filter(word => word.trim() !== "");

    // 2. 유효한 키워드가 하나도 없으면 저장을 막습니다.
    if (validKeywords.length === 0) {
      alert("⚠️ 저장할 키워드가 없습니다!\n최소 한 개 이상의 태그를 입력해주세요.");
      return; // 함수 종료 (서버 요청 안 함)
    }

    try {
      // 3. 걸러진 '진짜 키워드'만 서버로 보냅니다.
      await axios.post(`http://141.147.164.232:8080/api/analyze/save/${uploadedId}`, {
        keywords: validKeywords
      });
      alert("🎉 키워드가 안전하게 저장되었습니다!");
      setStep(3); // 저장 완료 상태
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
          <h3>✏️ 해시태그 편집</h3>
          <p className="sub-text">AI 추천 태그입니다. 자유롭게 수정하고 추가하세요!</p>

          <div className="keyword-edit-list">
            {keywords.map((word, index) => (
              // ✅ 디자인 변경된 키워드 입력 그룹
              <div key={index} className="keyword-input-group">
                <span className="hash-mark">#</span> {/* 샵(#) 모양 추가 */}
                <input 
                  ref={el => inputRefs.current[index] = el} // 너비 조절용 ref 연결
                  type="text" 
                  value={word}
                  placeholder="태그 입력"
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  className="keyword-input"
                  style={{ width: `${Math.max(word.length * 12, 60)}px` }} // 초기 너비 설정
                />
                {/* ✅ 옆으로 이동한 삭제 버튼 */}
                <button onClick={() => handleDeleteKeyword(index)} className="btn-delete" title="삭제">
                  ×
                </button>
              </div>
            ))}
            <button onClick={handleAddKeyword} className="btn-add">+ 추가</button>
          </div>

          {step === 2 && (
            <button onClick={handleFinalSave} className="btn-save-final">
              💾 이대로 저장하기
            </button>
          )}
          {step === 3 && <p style={{color: '#2ecc71', fontWeight: 'bold'}}>✅ 저장이 완료되었습니다!</p>}
        </div>
      )}
    </div>
  );
}

export default ImageAnalysisPage;