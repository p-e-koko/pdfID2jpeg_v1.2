import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface UsageStats {
  totalUsers: number;
  totalConversions: number;
  totalFilesProcessed: number;
  dailyStats: { date: string; conversions: number; users: number }[];
  popularSettings: {
    dpi: { [key: string]: number };
    quality: { [key: string]: number };
    scale: { [key: string]: number };
  };
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<UsageStats>({
    totalUsers: 0,
    totalConversions: 0,
    totalFilesProcessed: 0,
    dailyStats: [],
    popularSettings: {
      dpi: {},
      quality: {},
      scale: {}
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const ADMIN_PASSWORD = 'admin2025'; // Change this to your preferred password

  useEffect(() => {
    // Check if already authenticated in this session
    const sessionAuth = sessionStorage.getItem('analyticsAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const loadAnalytics = () => {
        try {
          const savedStats = localStorage.getItem('pdfConverterAnalytics');
          if (savedStats) {
            setStats(JSON.parse(savedStats));
          } else {
            // No data found, add some sample data for demonstration
            const sampleData: UsageStats = {
              totalUsers: 1,
              totalConversions: 1,
              totalFilesProcessed: 1,
              dailyStats: [
                {
                  date: new Date().toISOString().split('T')[0],
                  conversions: 1,
                  users: 1
                }
              ],
              popularSettings: {
                dpi: { '200': 1 },
                quality: { '95': 1 },
                scale: { '0.6': 1 }
              }
            };
            setStats(sampleData);
            localStorage.setItem('pdfConverterAnalytics', JSON.stringify(sampleData));
          }
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          setLoading(false);
        }
      };

      loadAnalytics();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('analyticsAuth', 'true');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="auth-header">
            <h2>🔒 Analytics Access</h2>
            <p>Enter password to view analytics</p>
          </div>
          <div className="auth-content">
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                autoFocus
              />
              <button type="submit" className="login-button">
                Access Analytics
              </button>
            </form>
            <Link href="/" className="back-link">
              ← Back to Converter
            </Link>
          </div>
        </div>
        
        <style jsx>{`
          .auth-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 40px);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .auth-form {
            max-width: 400px;
            margin: 0 auto;
            background: #1e293b;
            border-radius: 16px;
            box-shadow: 
              0 20px 40px rgba(0,0,0,0.3),
              0 1px 3px rgba(0,0,0,0.2);
            overflow: hidden;
            border: 1px solid #334155;
            text-align: center;
          }

          .auth-header {
            background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
            color: white;
            padding: 40px;
          }

          .auth-form h2 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #f1f5f9;
          }

          .auth-form p {
            font-size: 1.1em;
            opacity: 0.9;
            font-weight: 300;
            letter-spacing: 0.5px;
            color: #cbd5e1;
            margin: 0;
          }

          .auth-content {
            background: #1e293b;
            padding: 40px;
          }

          .password-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #334155;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
            transition: all 0.3s ease;
            background: #334155;
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .password-input:focus {
            outline: none;
            border-color: #1e40af;
            background: #374151;
          }

          .password-input::placeholder {
            color: #9ca3af;
          }

          .login-button {
            width: 100%;
            background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
          }

          .back-link {
            color: #60a5fa;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
          }

          .back-link:hover {
            color: #93c5fd;
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMostPopularSetting = (settings: { [key: string]: number }) => {
    const entries = Object.entries(settings);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0];
  };

  // Debug functions
  const addTestData = () => {
    const currentData = JSON.parse(localStorage.getItem('pdfConverterAnalytics') || '{}');
    const testData = {
      totalUsers: (currentData.totalUsers || 0) + 1,
      totalConversions: (currentData.totalConversions || 0) + 1,
      totalFilesProcessed: (currentData.totalFilesProcessed || 0) + 2,
      dailyStats: [
        ...(currentData.dailyStats || []),
        {
          date: new Date().toISOString().split('T')[0],
          conversions: (currentData.totalConversions || 0) + 1,
          users: (currentData.totalUsers || 0) + 1
        }
      ],
      popularSettings: {
        dpi: { ...currentData.popularSettings?.dpi, '200': ((currentData.popularSettings?.dpi?.['200']) || 0) + 1 },
        quality: { ...currentData.popularSettings?.quality, '95': ((currentData.popularSettings?.quality?.['95']) || 0) + 1 },
        scale: { ...currentData.popularSettings?.scale, '0.6': ((currentData.popularSettings?.scale?.['0.6']) || 0) + 1 }
      }
    };
    localStorage.setItem('pdfConverterAnalytics', JSON.stringify(testData));
    setStats(testData);
    alert('Test data added! Analytics updated.');
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all analytics data?')) {
      localStorage.removeItem('pdfConverterAnalytics');
      localStorage.removeItem('pdfConverterUserId');
      setStats({
        totalUsers: 0,
        totalConversions: 0,
        totalFilesProcessed: 0,
        dailyStats: [],
        popularSettings: { dpi: {}, quality: {}, scale: {} }
      });
      alert('All analytics data cleared!');
    }
  };

  const showRawData = () => {
    const rawData = localStorage.getItem('pdfConverterAnalytics');
    const userId = localStorage.getItem('pdfConverterUserId');
    alert(`Raw Analytics Data:\n${rawData}\n\nUser ID: ${userId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading analytics...</div>
        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .loading {
            font-size: 18px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <Link href="/" className="back-link">
          ← Back to Converter
        </Link>
        <h1>📊 Usage Analytics</h1>
        <p>Track how your PDF to JPG converter is being used</p>
      </div>

      <div className="main-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-description">Unique visitors who used the converter</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.totalConversions.toLocaleString()}</div>
            <div className="stat-label">Total Conversions</div>
            <div className="stat-description">Number of conversion sessions completed</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.totalFilesProcessed.toLocaleString()}</div>
            <div className="stat-label">Files Processed</div>
            <div className="stat-description">Total PDF files converted to JPG</div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <h3>📈 Daily Usage Trend</h3>
            {stats.dailyStats.length > 0 ? (
              <div className="daily-stats">
                {stats.dailyStats.slice(-7).map((day, index) => (
                  <div key={index} className="daily-stat">
                    <div className="date">{formatDate(day.date)}</div>
                    <div className="metrics">
                      <span className="conversions">{day.conversions} conversions</span>
                      <span className="users">{day.users} users</span>
                    </div>
                    <div className="bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${Math.max((day.conversions / Math.max(...stats.dailyStats.map(d => d.conversions))) * 100, 5)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No usage data available yet</div>
            )}
          </div>

          <div className="chart-card">
            <h3>⚙️ Popular Settings</h3>
            <div className="settings-stats">
              <div className="setting-group">
                <h4>Most Popular DPI</h4>
                <div className="setting-value">{getMostPopularSetting(stats.popularSettings.dpi)}</div>
              </div>
              <div className="setting-group">
                <h4>Most Popular Quality</h4>
                <div className="setting-value">{getMostPopularSetting(stats.popularSettings.quality)}</div>
              </div>
              <div className="setting-group">
                <h4>Most Popular Scale</h4>
                <div className="setting-value">{getMostPopularSetting(stats.popularSettings.scale)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>ℹ️ About Analytics</h3>
            <ul>
              <li>Data is stored locally in your browser</li>
              <li>No personal information is collected</li>
              <li>Analytics track usage patterns to improve the tool</li>
              <li>Data resets when browser storage is cleared</li>
            </ul>
          </div>

          <div className="debug-card">
            <h3>🔧 Debug Tools</h3>
            <p>Use these tools to test and manage analytics data:</p>
            <div className="debug-buttons">
              <button onClick={addTestData} className="debug-btn add-btn">
                Add Test Data
              </button>
              <button onClick={showRawData} className="debug-btn info-btn">
                Show Raw Data
              </button>
              <button onClick={clearAllData} className="debug-btn clear-btn">
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          background: #1e293b;
          border-radius: 16px;
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.3),
            0 1px 3px rgba(0,0,0,0.2);
          overflow: hidden;
          border: 1px solid #334155;
          margin-top: 20px;
          margin-bottom: 20px;
        }

        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
          color: white;
          padding: 40px;
          text-align: center;
          position: relative;
        }

        .back-link {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #cbd5e1;
          text-decoration: none;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 14px;
        }

        .back-link:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #f1f5f9;
        }

        .header h1 {
          font-size: 3em;
          margin-bottom: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f1f5f9;
        }

        .header p {
          font-size: 1.3em;
          opacity: 0.9;
          font-weight: 300;
          letter-spacing: 0.5px;
          color: #cbd5e1;
          margin: 0;
        }

        .main-content {
          background: #1e293b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          padding: 40px;
          background: #1e293b;
        }

        .stat-card {
          background: #334155;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          border: 1px solid #475569;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          border-color: #1e40af;
        }

        .stat-number {
          font-size: 3em;
          font-weight: 700;
          color: #60a5fa;
          margin-bottom: 10px;
          line-height: 1;
        }

        .stat-label {
          font-size: 1.2em;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 8px;
        }

        .stat-description {
          font-size: 0.9em;
          color: #cbd5e1;
          line-height: 1.4;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          padding: 0 40px;
          background: #1e293b;
        }

        @media (max-width: 768px) {
          .charts-section {
            grid-template-columns: 1fr;
            padding: 0 20px;
          }
          .stats-grid {
            padding: 20px;
          }
        }

        .chart-card {
          background: #334155;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #475569;
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .chart-card h3 {
          color: #f1f5f9;
          margin-bottom: 20px;
          font-size: 1.3em;
          font-weight: 600;
        }

        .daily-stats {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .daily-stat {
          padding: 15px 0;
          border-bottom: 1px solid #475569;
        }

        .daily-stat:last-child {
          border-bottom: none;
        }

        .date {
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 5px;
        }

        .metrics {
          display: flex;
          gap: 15px;
          margin-bottom: 8px;
          font-size: 0.9em;
        }

        .conversions {
          color: #60a5fa;
          font-weight: 500;
        }

        .users {
          color: #a78bfa;
          font-weight: 500;
        }

        .bar {
          height: 8px;
          background: #475569;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          transition: width 0.3s ease;
        }

        .no-data {
          text-align: center;
          color: #94a3b8;
          font-style: italic;
          padding: 40px;
        }

        .settings-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-group h4 {
          color: #cbd5e1;
          font-size: 0.9em;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .setting-value {
          font-size: 1.5em;
          font-weight: 700;
          color: #60a5fa;
          padding: 10px;
          background: #1e293b;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #334155;
        }

        .info-section {
          padding: 40px 40px 40px;
          background: #1e293b;
        }

        .info-card {
          background: #334155;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #475569;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .info-card h3 {
          color: #f1f5f9;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .info-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-card li {
          color: #cbd5e1;
          padding: 8px 0;
          border-bottom: 1px solid #475569;
          position: relative;
          padding-left: 20px;
          font-size: 0.95em;
          line-height: 1.5;
        }

        .info-card li:last-child {
          border-bottom: none;
        }

        .info-card li::before {
          content: "•";
          color: #60a5fa;
          position: absolute;
          left: 0;
          font-weight: bold;
        }

        .debug-card {
          background: #334155;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #475569;
          transition: all 0.3s ease;
          margin-top: 20px;
        }

        .debug-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .debug-card h3 {
          color: #f1f5f9;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .debug-card p {
          color: #cbd5e1;
          margin-bottom: 20px;
          font-size: 0.95em;
        }

        .debug-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .debug-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .add-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .info-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .info-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .clear-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .clear-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        @media (max-width: 600px) {
          .info-section {
            padding: 0 20px 20px;
          }
          
          .header {
            padding: 20px;
          }
          
          .back-link {
            position: static;
            display: inline-block;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
