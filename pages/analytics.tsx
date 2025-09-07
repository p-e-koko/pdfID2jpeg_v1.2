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
          <h2>🔒 Analytics Access</h2>
          <p>Enter password to view analytics</p>
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
        
        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
          }

          .auth-form {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }

          .auth-form h2 {
            color: #333;
            margin-bottom: 10px;
            font-size: 1.8em;
          }

          .auth-form p {
            color: #666;
            margin-bottom: 30px;
          }

          .password-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
          }

          .password-input:focus {
            outline: none;
            border-color: #667eea;
          }

          .login-button {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
            margin-bottom: 20px;
          }

          .login-button:hover {
            transform: translateY(-2px);
          }

          .back-link {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
          }

          .back-link:hover {
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
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 20px;
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          transition: background 0.3s ease;
        }

        .back-link:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        h1 {
          color: white;
          font-size: 2.5em;
          margin: 20px 0 10px 0;
          font-weight: 700;
        }

        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1em;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-number {
          font-size: 3em;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 1.2em;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .stat-description {
          font-size: 0.9em;
          color: #666;
          line-height: 1.4;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chart-card h3 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.3em;
        }

        .daily-stats {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .daily-stat {
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }

        .daily-stat:last-child {
          border-bottom: none;
        }

        .date {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .metrics {
          display: flex;
          gap: 15px;
          margin-bottom: 8px;
          font-size: 0.9em;
        }

        .conversions {
          color: #667eea;
        }

        .users {
          color: #764ba2;
        }

        .bar {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
        }

        .no-data {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }

        .settings-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-group h4 {
          color: #333;
          font-size: 0.9em;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .setting-value {
          font-size: 1.5em;
          font-weight: 700;
          color: #667eea;
          padding: 10px;
          background: #f8f9ff;
          border-radius: 8px;
          text-align: center;
        }

        .info-section {
          margin-bottom: 40px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .info-card h3 {
          color: #333;
          margin-bottom: 15px;
        }

        .info-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-card li {
          color: #555;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          position: relative;
          padding-left: 20px;
        }

        .info-card li:last-child {
          border-bottom: none;
        }

        .info-card li::before {
          content: "•";
          color: #667eea;
          position: absolute;
          left: 0;
        }
      `}</style>
    </div>
  );
};

export default Analytics;
