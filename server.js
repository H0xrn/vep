const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1382251782134173737/NQDrX9mI9YtCc12Xc0zPdmwVzoiW_WhxLA1CODlWdYLBhqbo2-CTjZJ_D8yeqYbsIl8M';

// PDF file configuration
const PDF_CONFIG = {
  filename: 'document.pdf',
  displayName: 'Premium Document',
  description: 'High-quality PDF document with comprehensive content',
  pages: 45,
  sizeInBytes: 2621440, // 2.5 MB
  category: 'Educational'
};

// Function to get real IP address
function getRealIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
}

// Function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to send Discord webhook
async function sendDiscordWebhook(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      content: message,
      username: 'PDF Server Bot',
      avatar_url: 'https://cdn.discordapp.com/emojis/1234567890123456789.png'
    });

    const url = new URL(DISCORD_WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`Discord webhook failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Function to get file information
function getFileInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      formattedSize: formatFileSize(stats.size),
      modified: stats.mtime,
      created: stats.birthtime
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

// Middleware to log connections
app.use(async (req, res, next) => {
  const ip = getRealIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const hostname = req.hostname || 'Unknown';
  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();

  // Only log for main routes, not static files
  if (req.url === '/' || req.url === '/download') {
    try {
      // Send connection notification
      await sendDiscordWebhook(`🌐 **New Connection**: ${ip} accessed ${url}`);
      
      // Send detailed information after a delay
      const detailedMessage = `
📊 **Connection Details**
🌍 **IP**: ${ip}
🖥️ **User Agent**: ${userAgent}
🏠 **Host**: ${hostname}
📝 **Method**: ${method}
🔗 **URL**: ${url}
⏰ **Timestamp**: ${timestamp}
─────────────────────────────
      `.trim();
      
      setTimeout(() => {
        sendDiscordWebhook(detailedMessage);
      }, 1000);
      
    } catch (error) {
      console.error('Discord webhook error:', error);
    }
  }
  
  next();
});

// Serve static files from public directory
app.use(express.static('public'));

// Main route - serve the download page
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'files', PDF_CONFIG.filename);
  const fileInfo = getFileInfo(filePath);
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
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
                max-width: 600px;
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
            
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 1.1em;
                line-height: 1.6;
            }
            
            .file-card {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                border-left: 4px solid #667eea;
                text-align: left;
            }
            
            .file-title {
                color: #333;
                font-size: 1.4em;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .file-description {
                color: #666;
                margin-bottom: 20px;
                line-height: 1.5;
            }
            
            .file-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .detail-item {
                background: rgba(255, 255, 255, 0.8);
                padding: 12px;
                border-radius: 8px;
                text-align: center;
            }
            
            .detail-label {
                font-size: 0.9em;
                color: #666;
                margin-bottom: 5px;
            }
            
            .detail-value {
                font-weight: 600;
                color: #333;
                font-size: 1.1em;
            }
            
            .status-indicator {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 500;
                margin-top: 15px;
            }
            
            .status-available {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .status-error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
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
                margin-top: 20px;
            }
            
            .download-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
            }
            
            .download-btn:active {
                transform: translateY(0);
            }
            
            .download-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
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
            
            .download-icon {
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
            
            .error-message {
                color: #721c24;
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
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
                
                .file-details {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📄 PDF Download Center</h1>
            <p class="subtitle">Access high-quality PDF documents with secure download and tracking.</p>
            
            <div class="file-card">
                <div class="file-title">${PDF_CONFIG.displayName}</div>
                <div class="file-description">${PDF_CONFIG.description}</div>
                
                <div class="file-details">
                    <div class="detail-item">
                        <div class="detail-label">Format</div>
                        <div class="detail-value">PDF</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Size</div>
                        <div class="detail-value">${fileInfo.exists ? fileInfo.formattedSize : formatFileSize(PDF_CONFIG.sizeInBytes)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Pages</div>
                        <div class="detail-value">${PDF_CONFIG.pages}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Category</div>
                        <div class="detail-value">${PDF_CONFIG.category}</div>
                    </div>
                </div>
                
                ${fileInfo.exists ? 
                    '<div class="status-indicator status-available">✅ File Available</div>' : 
                    '<div class="status-indicator status-error">❌ File Not Found</div>'
                }
                
                ${!fileInfo.exists ? 
                    `<div class="error-message">
                        <strong>Error:</strong> The PDF file "${PDF_CONFIG.filename}" was not found in the files directory. 
                        Please ensure the file exists at: /files/${PDF_CONFIG.filename}
                    </div>` : ''
                }
                
                <a href="/download" class="download-btn" ${!fileInfo.exists ? 'onclick="return false;" style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                    <span class="download-icon">📥</span>
                    ${fileInfo.exists ? 'Download PDF' : 'File Not Available'}
                </a>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-number">1,234</span>
                    <div class="stat-label">Downloads</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">4.9</span>
                    <div class="stat-label">Rating</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">99%</span>
                    <div class="stat-label">Satisfied</div>
                </div>
            </div>
        </div>
        
        <script>
            // Add click animation for download button
            document.querySelector('.download-btn').addEventListener('click', function(e) {
                // Don't animate if button is disabled
                if (this.style.cursor === 'not-allowed') return;
                
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
            
            // Loading effect for download
            const downloadBtn = document.querySelector('.download-btn');
            if (downloadBtn.style.cursor !== 'not-allowed') {
                downloadBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Change button text during download
                    const originalText = this.innerHTML;
                    this.innerHTML = '<span class="download-icon">⏳</span> Preparing Download...';
                    this.style.pointerEvents = 'none';
                    
                    setTimeout(() => {
                        window.location.href = '/download';
                        
                        setTimeout(() => {
                            this.innerHTML = originalText;
                            this.style.pointerEvents = 'auto';
                        }, 2000);
                    }, 1500);
                });
            }
        </script>
    </body>
    </html>
  `);
});

// Download route
app.get('/download', async (req, res) => {
  try {
    const ip = getRealIP(req);
    const filePath = path.join(__dirname, 'files', PDF_CONFIG.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).send(`
        <html>
          <head>
            <title>File Not Found</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .error-container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #e74c3c; margin-bottom: 20px; }
              p { color: #666; margin-bottom: 30px; }
              a { color: #667eea; text-decoration: none; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; }
              a:hover { background: #e0e0e0; }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h1>❌ File Not Found</h1>
              <p>The requested PDF file "${PDF_CONFIG.filename}" could not be found on the server.</p>
              <p>Please make sure the file exists in the <code>/files/</code> directory.</p>
              <a href="/">← Back to Home</a>
            </div>
          </body>
        </html>
      `);
    }
    
    // Send download notification to Discord
    try {
      await sendDiscordWebhook(`📥 **Download Started** - IP: ${ip} | File: ${PDF_CONFIG.filename}`);
    } catch (discordError) {
      console.error('Discord notification failed:', discordError);
    }
    
    // Get actual file info
    const fileInfo = getFileInfo(filePath);
    
    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${PDF_CONFIG.displayName}.pdf"`);
    res.setHeader('Content-Length', fileInfo.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).send('Error reading file');
      }
    });
    
    fileStream.on('end', () => {
      // Send completion notification
      sendDiscordWebhook(`✅ **Download Completed** - IP: ${ip} | File: ${PDF_CONFIG.filename} | Size: ${fileInfo.formattedSize}`);
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error processing download request');
  }
});

// API endpoints
app.get('/api/file-info', (req, res) => {
  const filePath = path.join(__dirname, 'files', PDF_CONFIG.filename);
  const fileInfo = getFileInfo(filePath);
  
  res.json({
    ...PDF_CONFIG,
    exists: fileInfo.exists,
    actualSize: fileInfo.exists ? fileInfo.size : null,
    formattedSize: fileInfo.exists ? fileInfo.formattedSize : formatFileSize(PDF_CONFIG.sizeInBytes),
    lastModified: fileInfo.exists ? fileInfo.modified : null,
    error: fileInfo.error || null
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    downloads: 1234,
    rating: 4.9,
    satisfaction: 99,
    serverUptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  const filePath = path.join(__dirname, 'files', PDF_CONFIG.filename);
  const fileInfo = getFileInfo(filePath);
  
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'PDF Download Server is running',
    fileStatus: fileInfo.exists ? 'Available' : 'Not Found',
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>404 - Page Not Found</title>
        <style>
          body { 
            font-family: 'Segoe UI', sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            max-width: 500px;
          }
          h1 { color: #667eea; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 30px; }
          a { 
            color: white; 
            text-decoration: none; 
            background: linear-gradient(45deg, #667eea, #764ba2);
            padding: 12px 24px; 
            border-radius: 25px;
            transition: transform 0.3s ease;
            display: inline-block;
          }
          a:hover { transform: translateY(-2px); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist on this server.</p>
          <a href="/">← Back to Home</a>
        </div>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PDF Download Server is running on port ${PORT}`);
  console.log(`📄 Access your PDF download page at: http://localhost:${PORT}`);
  console.log(`📁 Make sure to place your PDF file at: ./files/${PDF_CONFIG.filename}`);
  console.log(`🔧 Server started at: ${new Date().toISOString()}`);
});
