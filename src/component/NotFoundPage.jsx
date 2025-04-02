import React from 'react';

const Error404Page = () => {
    return (
        <div className="error-page">
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="container">
                <div className="illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
                        {/* Trang giấy */}
                        <path d="M150,50 L350,50 L350,350 L150,350 Z" fill="#fff" stroke="#ddd" strokeWidth="3"/>
                        <path d="M175,80 L325,80 M175,120 L325,120 M175,160 L275,160 M175,200 L250,200" stroke="#eee" strokeWidth="5" strokeLinecap="round"/>

                        {/* Kính lúp */}
                        <circle cx="320" cy="230" r="70" fill="#fff" stroke="#FF8A3D" strokeWidth="8"/>
                        <circle cx="320" cy="230" r="60" fill="none" stroke="#FFC097" strokeWidth="3"/>
                        <line x1="375" y1="280" x2="420" y2="330" stroke="#FF8A3D" strokeWidth="12" strokeLinecap="round"/>

                        {/* Dấu hỏi chấm */}
                        <text x="320" y="260" fontSize="80" textAnchor="middle" fill="#FF8A3D" fontWeight="bold">?</text>

                        {/* Mặt buồn */}
                        <circle cx="220" cy="260" r="40" fill="#FFF0E6" stroke="#FFC097" strokeWidth="2"/>
                        <circle cx="205" cy="250" r="4" fill="#666"/>
                        <circle cx="235" cy="250" r="4" fill="#666"/>
                        <path d="M200,275 Q220,265 240,275" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="error-code">404</div>
                <h1 className="error-message">Không tìm thấy trang</h1>
                <p className="error-description">Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển đến một địa chỉ khác.</p>
                <a href="/" className="back-button">Trở về trang chủ</a>
            </div>

            <style jsx>{`
        .error-page {
          background-color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #333;
          position: relative;
          overflow: hidden;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .container {
          text-align: center;
          max-width: 600px;
          padding: 40px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          position: relative;
          z-index: 1;
        }
        
        .error-code {
          font-size: 140px;
          font-weight: 800;
          color: #FF8A3D;
          margin-bottom: 10px;
          line-height: 1.2;
        }
        
        .error-message {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
        }
        
        .error-description {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        
        .back-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #FF8A3D;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        
        .back-button:hover {
          background-color: #E67422;
        }
        
        .illustration {
          max-width: 250px;
          margin: 0 auto 30px;
        }
        
        .bg-shapes {
          position: absolute;
          height: 100%;
          width: 100%;
          z-index: 0;
        }
        
        .shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.2;
        }
        
        .shape-1 {
          width: 200px;
          height: 200px;
          background-color: #FF8A3D;
          top: 10%;
          left: 15%;
          animation: float 8s infinite alternate;
        }
        
        .shape-2 {
          width: 150px;
          height: 150px;
          background-color: #FF8A3D;
          bottom: 15%;
          right: 10%;
          animation: float 6s infinite alternate-reverse;
          opacity: 0.15;
        }
        
        .shape-3 {
          width: 100px;
          height: 100px;
          background-color: #FFC097;
          bottom: 30%;
          left: 20%;
          animation: float 7s infinite alternate;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 30px 20px;
            margin: 0 20px;
          }
          
          .error-code {
            font-size: 100px;
          }
          
          .error-message {
            font-size: 22px;
          }
          
          .illustration {
            max-width: 180px;
          }
        }
      `}</style>
        </div>
    );
};

export default Error404Page;