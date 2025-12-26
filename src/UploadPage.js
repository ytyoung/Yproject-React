import React, { useState } from "react";
import axios from "axios";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택해주세요!");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://141.147.164.232/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedUrl(`http://141.147.164.232${res.data.file.path}`);
      alert("✅ 업로드 성공!");
    } catch (err) {
      console.error(err);
      alert("업로드 실패");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>📸 이미지 업로드 테스트</h2>
      <input type="file" onChange={handleFileChange} />
      {preview && <div><img src={preview} alt="미리보기" style={{ width: "300px", marginTop: "10px" }} /></div>}
      <button onClick={handleUpload} style={{ marginTop: "10px" }}>업로드</button>
      {uploadedUrl && (
        <div style={{ marginTop: "20px" }}>
            <p>✅ 서버에 저장된 이미지:</p>
            <img src={uploadedUrl} alt="업로드 결과" style={{ width: "300px" }} />
            {resData?.file?.tags && (
                <p>🧩 자동 태그: {resData.file.tags.join(", ")}</p>
            )}
    </div>
      )}
    </div>
  );
}

export default UploadPage;