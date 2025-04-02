import React from 'react';

const ErrorPage = ({ errorCode = '500', title, description }) => {
    // Cấu hình mặc định cho từng loại lỗi
    const errorTypes = {
        '400': {
            title: 'Yêu cầu không hợp lệ',
            description: 'Yêu cầu của bạn không được máy chủ hiểu do cú pháp không hợp lệ.',
            color: '#FF8A3D'
        },
        '401': {
            title: 'Không được phép truy cập',
            description: 'Bạn cần đăng nhập hoặc không có quyền truy cập vào trang này.',
            color: '#FF5733'
        },
        '403': {
            title: 'Bị cấm truy cập',
            description: 'Bạn không có quyền truy cập vào trang này.',
            color: '#C70039'
        },
        '500': {
            title: 'Lỗi máy chủ',
            description: 'Rất tiếc, đã xảy ra lỗi trong quá trình xử lý yêu cầu của bạn.',
            color: '#900C3F'
        },
        '502': {
            title: 'Cổng không hợp lệ',
            description: 'Máy chủ nhận được phản hồi không hợp lệ từ máy chủ upstream.',
            color: '#581845'
        },
        '503': {
            title: 'Dịch vụ không khả dụng',
            description: 'Dịch vụ hiện không khả dụng do bảo trì hoặc quá tải.',
            color: '#900C3F'
        }
    };

    // Sử dụng giá trị được cung cấp hoặc mặc định cho loại lỗi
    const errorInfo = errorTypes[errorCode] || errorTypes['500'];
    const displayTitle = title || errorInfo.title;
    const displayDescription = description || errorInfo.description;
    const themeColor = errorInfo.color;

    // Biểu tượng tương ứng với loại lỗi
    const getErrorIcon = (code) => {
        switch (code) {
            case '401':
            case '403':
                return (
                    <svg viewBox="0 0 500 400">
                        <rect x="180" y="50" width="140" height="200" rx="10" fill="#fff" stroke="#ddd" strokeWidth="3"/>
                        <circle cx="250" cy="170" r="25" fill="#fff" stroke={themeColor} strokeWidth="5"/>
                        <rect x="245" y="80" width="10" height="60" rx="5" fill={themeColor}/>
                        <path d="M210,120 L290,120 L290,210 L210,210 Z" fill="#fff" stroke={themeColor} strokeWidth="5"/>
                        <circle cx="230" cy="165" r="8" fill={themeColor}/>
                        <circle cx="270" cy="165" r="8" fill={themeColor}/>
                        <path d="M220,190 L280,190" stroke={themeColor} strokeWidth="5" strokeLinecap="round"/>
                        <path d="M200,275 Q250,240 300,275" fill="none" stroke={themeColor} strokeWidth="5" strokeLinecap="round"/>
                    </svg>
                );
            case '500':
            case '502':
            case '503':
                return (
                    <svg viewBox="0 0 500 400">
                        <rect x="150" y="100" width="200" height="150" rx="10" fill="#fff" stroke="#ddd" strokeWidth="3"/>
                        <line x1="150" y1="135" x2="350" y2="135" stroke="#ddd" strokeWidth="3"/>
                        <circle cx="170" cy="118" r="8" fill={themeColor}/>
                        <circle cx="195" cy="118" r="8" fill={themeColor}/>
                        <circle cx="220" cy="118" r="8" fill={themeColor}/>
                        <path d="M175,220 L325,220 M175,190 L325,190 M175,160 L325,160" stroke="#eee" strokeWidth="8" strokeLinecap="round"/>
                        <path d="M200,280 L300,280 L250,320 Z" fill={themeColor}/>
                        <text x="250" y="310" fontSize="40" textAnchor="middle" fill="#fff" fontWeight="bold">!</text>
                    </svg>
                );
            default: // 400, 404 và các lỗi khác
                return (
                    <svg viewBox="0 0 500 400">
                        <path d="M150,50 L350,50 L350,350 L150,350 Z" fill="#fff" stroke="#ddd" strokeWidth="3"/>
                        <path d="M175,80 L325,80 M175,120 L325,120 M175,160 L275,160 M175,200 L250,200" stroke="#eee" strokeWidth="5" strokeLinecap="round"/>
                        <circle cx="320" cy="230" r="70" fill="#fff" stroke={themeColor} strokeWidth="8"/>
                        <circle cx="320" cy="230" r="60" fill="none" stroke={themeColor} strokeWidth="3" strokeOpacity="0.5"/>
                        <line x1="375" y1="280" x2="420" y2="330" stroke={themeColor} strokeWidth="12" strokeLinecap="round"/>
                        <text x="320" y="260" fontSize="80" textAnchor="middle" fill={themeColor} fontWeight="bold">?</text>
                        <circle cx="220" cy="260" r="40" fill="#FFF0E6" stroke={themeColor} strokeWidth="2" strokeOpacity="0.5"/>
                        <circle cx="205" cy="250" r="4" fill="#666"/>
                        <circle cx="235" cy="250" r="4" fill="#666"/>
                        <path d="M200,275 Q220,265 240,275" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                );
        }
    };

    return (
        <div className="error-page">
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="container">
                <div className="illustration">
                    {getErrorIcon(errorCode)}
                </div>
                <div className="error-code" style={{ color: themeColor }}>{errorCode}</div>
                <h1 className="error-message">{displayTitle}</h1>
                <p className="error-description">{displayDescription}</p>
                <a href="/" className="back-button" style={{ backgroundColor: themeColor }}>Trở về trang chủ</a>
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
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: opacity 0.3s;
        }
        
        .back-button:hover {
          opacity: 0.9;
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
          top: 10%;
          left: 15%;
          animation: float 8s infinite alternate;
        }
        
        .shape-2 {
          width: 150px;
          height: 150px;
          bottom: 15%;
          right: 10%;
          animation: float 6s infinite alternate-reverse;
          opacity: 0.15;
        }
        
        .shape-3 {
          width: 100px;
          height: 100px;
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

export default ErrorPage;