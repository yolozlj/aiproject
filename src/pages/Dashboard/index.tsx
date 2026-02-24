import { useEffect, useState } from 'react';
import { Card, Button, Space, Tag } from 'antd';
import {
  ArrowRightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDashboardStats } from '@/api';
import type { ProjectStats } from '@/types';
import { Loading } from '@/components/Common';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchStats();
    // Trigger animation after component mounts
    setTimeout(() => setMounted(true), 50);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!stats) {
    return null;
  }

  // Get current date info
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className={`minimal-dashboard ${mounted ? 'mounted' : ''}`}>
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">概览</h1>
            <p className="dashboard-date">{dateStr}</p>
          </div>
          <div className="header-actions">
            <Button
              type="text"
              icon={<PlusOutlined />}
              className="action-btn"
              onClick={() => navigate('/projects/new')}
            >
              新建项目
            </Button>
            <Button
              type="text"
              className="action-btn"
              onClick={() => navigate('/projects')}
            >
              查看全部
              <ArrowRightOutlined style={{ marginLeft: 4, fontSize: 12 }} />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-section">
        <div className="stats-grid">
          {/* Total Projects */}
          <div className="stat-card stat-card-1">
            <div className="stat-label">项目总数</div>
            <div className="stat-value stat-value-large">{stats.total}</div>
            <div className="stat-indicator">
              <div className="indicator-dot"></div>
              <span>全部项目</span>
            </div>
          </div>

          {/* Pending Review */}
          <div className="stat-card stat-card-2">
            <div className="stat-label">待评审</div>
            <div className="stat-value">{stats.pendingReview}</div>
            <div className="stat-meta">需要处理</div>
          </div>

          {/* In Progress */}
          <div className="stat-card stat-card-3">
            <div className="stat-label">开发中</div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-meta">进行中</div>
          </div>

          {/* Completed */}
          <div className="stat-card stat-card-4">
            <div className="stat-label">已完成</div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-meta">
              <span className="completion-rate">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
              完成率
            </div>
          </div>
        </div>
      </section>

      {/* Project Types Section */}
      <section className="types-section">
        <div className="section-header">
          <h2 className="section-title">项目类型分布</h2>
        </div>
        <div className="types-grid">
          <div className="type-card">
            <div className="type-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="type-info">
              <div className="type-label">数据开发需求</div>
              <div className="type-value">{stats.dataProjects}</div>
            </div>
            <div className="type-bar">
              <div
                className="type-bar-fill type-bar-data"
                style={{
                  width: `${stats.total > 0 ? (stats.dataProjects / stats.total) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div className="type-card">
            <div className="type-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="type-info">
              <div className="type-label">系统开发需求</div>
              <div className="type-value">{stats.systemProjects}</div>
            </div>
            <div className="type-bar">
              <div
                className="type-bar-fill type-bar-system"
                style={{
                  width: `${stats.total > 0 ? (stats.systemProjects / stats.total) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="actions-section">
        <div className="section-header">
          <h2 className="section-title">快速操作</h2>
        </div>
        <div className="actions-grid">
          <button
            className="action-card"
            onClick={() => navigate('/projects/new')}
          >
            <div className="action-icon">
              <PlusOutlined />
            </div>
            <div className="action-label">创建新项目</div>
            <div className="action-arrow">→</div>
          </button>

          <button
            className="action-card"
            onClick={() => navigate('/projects?status=pending_review')}
          >
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="action-label">待评审项目</div>
            <div className="action-arrow">→</div>
          </button>

          <button
            className="action-card"
            onClick={() => navigate('/projects?status=in_progress')}
          >
            <div className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 6L21 12L8 18V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M3 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="action-label">进行中项目</div>
            <div className="action-arrow">→</div>
          </button>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-text">
            系统运行正常 · 最后更新于 {now.toLocaleTimeString('zh-CN')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
