import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* 로고 */}
        <Link to="/" className="navbar-logo">
          PhotoSense 📸
        </Link>

        {/* 햄버거 메뉴 아이콘 */}
        <div className="menu-icon" onClick={toggleMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        {/* 드롭다운 메뉴 리스트 */}
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={toggleMenu}>
              이미지 분석
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/search" className="nav-links" onClick={toggleMenu}>
              키워드 검색
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;