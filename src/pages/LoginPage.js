import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneLast4 }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("로그인 성공!");
        setTimeout(() => navigate("/main"), 1000);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("서버 연결 실패");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>회비 관리 로그인</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <input
          type="text"
          placeholder="휴대폰 뒷 4자리"
          value={phoneLast4}
          onChange={(e) => setPhoneLast4(e.target.value)}
          required
        />
        <br />
        <button type="submit">로그인</button>
      </form>
      <p>{message}</p>
    </div>
  );
}