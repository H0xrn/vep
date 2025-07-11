const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Main route - serve the beautiful download page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PDF Download Center</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
                animation: fadeInUp 0.6s ease-out;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5em;
                font-weight: 700;
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            p {
                color: #666;
                margin-bottom: 30px;
                font-size: 1.1em;
                line-height: 1.6;
            }
            
            .download-btn {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                padding: 18px 36px;
                border: none;
                border-radius: 50px;
                font-size: 1.1em;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .download-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
            }
            
            .download-btn:active {
                transform: translateY(0);
            }
            
            .download-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }
            
            .download-btn:hover::before {
                left: 100%;
            }
            
            .pdf-icon {
                font-size: 1.3em;
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-5px);
                }
                60% {
                    transform: translateY(-3px);
                }
            }
            
            .file-info {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 15px;
                padding: 20px;
                margin: 30px 0;
                border-left: 4px solid #667eea;
            }
            
            .file-info h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 1.2em;
            }
            
            .file-info ul {
                list-style: none;
                color: #666;
                text-align: left;
            }
            
            .file-info li {
                margin: 8px 0;
                padding-left: 20px;
                position: relative;
            }
            
            .file-info li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
            }
            
            .stats {
                display: flex;
                justify-content: space-around;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(102, 126, 234, 0.2);
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-number {
                font-size: 2em;
                font-weight: bold;
                color: #667eea;
                display: block;
            }
            
            .stat-label {
                font-size: 0.9em;
                color: #666;
                margin-top: 5px;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 30px 20px;
                }
                
                h1 {
                    font-size: 2em;
                }
                
                .download-btn {
                    padding: 16px 32px;
                    font-size: 1em;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📄 PDF Center</h1>
            <p>Tải xuống tài liệu PDF chất lượng cao với thiết kế hiện đại và trải nghiệm người dùng tuyệt vời.</p>
            
            <div class="file-info">
                <h3>Thông tin tệp tin</h3>
                <ul>
                    <li>Định dạng: PDF</li>
                    <li>Kích thước: 2.5 MB</li>
                    <li>Trang: 45 trang</li>
                    <li>Chất lượng: HD</li>
                </ul>
            </div>
            
            <a href="/download" class="download-btn">
                <span class="pdf-icon">📥</span>
                Tải xuống PDF
            </a>
            
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-number">1,234</span>
                    <div class="stat-label">Lượt tải</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">4.9</span>
                    <div class="stat-label">Đánh giá</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">99%</span>
                    <div class="stat-label">Hài lòng</div>
                </div>
            </div>
        </div>
        
        <script>
            // Add click animation
            document.querySelector('.download-btn').addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = \`
                    position: absolute;
                    width: \${size}px;
                    height: \${size}px;
                    left: \${x}px;
                    top: \${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                \`;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
            
            // Add CSS for ripple animation
            const style = document.createElement('style');
            style.textContent = \`
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            \`;
            document.head.appendChild(style);
            
            // Smooth scroll and loading effect
            document.querySelector('.download-btn').addEventListener('click', function(e) {
                e.preventDefault();
                
                // Change button text during download
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="pdf-icon">⏳</span> Đang tải...';
                this.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    window.location.href = '/download';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.style.pointerEvents = 'auto';
                    }, 2000);
                }, 1000);
            });
        </script>
    </body>
    </html>
  `);
});

// Download route
app.get('/download', (req, res) => {
  try {
    // Create a sample PDF content (you can replace this with actual PDF generation)
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Hello from Railway Server!) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000370 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
467
%%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="railway-document.pdf"');
    res.setHeader('Content-Length', Buffer.byteLength(pdfContent));
    
    res.send(pdfContent);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Lỗi khi tải file PDF');
  }
});

// Health check route for Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Railway PDF Download Server is running!'
  });
});

// API endpoint for file info
app.get('/api/file-info', (req, res) => {
  res.json({
    filename: 'railway-document.pdf',
    size: '2.5 MB',
    pages: 45,
    format: 'PDF',
    downloads: 1234,
    rating: 4.9,
    satisfaction: 99
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>404 - Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #667eea; }
          a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>404 - Trang không tồn tại</h1>
        <p>Trang bạn tìm kiếm không tồn tại.</p>
        <a href="/">← Quay lại trang chủ</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Railway PDF Server is running on port ${PORT}`);
  console.log(`📄 Access your beautiful PDF download page at: http://localhost:${PORT}`);
});
