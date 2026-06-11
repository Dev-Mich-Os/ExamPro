import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { Layout, PageHeader, StatCard, Card, Spinner, Alert, Badge } from '../../components/shared';

export const InstructorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsAPI.dashboardStats()
      .then(res => setStats(res.data.data))
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <PageHeader title="Dashboard" subtitle="Overview of your examination system" />
      {error && <Alert message={error} onClose={() => setError('')} />}
      {stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="#4f46e5" />
            <StatCard label="Courses" value={stats.totalCourses} icon="📚" color="#10b981" />
            <StatCard label="Exams" value={stats.totalExams} icon="📝" color="#f59e0b" />
            <StatCard label="Questions" value={stats.totalQuestions} icon="❓" color="#8b5cf6" />
            <StatCard label="Attempts" value={stats.totalAttempts} icon="✍️" color="#ef4444" />
            <StatCard label="Avg Score" value={`${stats.avgScore}%`} icon="📈" color="#06b6d4" />
            <StatCard label="Pass Rate" value={`${stats.passRate}%`} icon="🏆" color="#10b981" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Top Students */}
            <Card>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>🏆 Top Performing Students</h3>
              {stats.topStudents.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>No data yet</p>
              ) : (
                <div>
                  {stats.topStudents.map((s, i) => (
                    <div key={s.username} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0', borderBottom: i < stats.topStudents.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: '#4f46e5',
                        color: '#fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.username}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{s.attempts} attempts</div>
                      </div>
                      <Badge color={parseFloat(s.avg_score) >= 70 ? 'green' : 'yellow'}>
                        {parseFloat(s.avg_score).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>🕐 Recent Submissions</h3>
              {stats.recentActivity.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>No submissions yet</p>
              ) : (
                <div>
                  {stats.recentActivity.map((a, i) => (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0', borderBottom: i < stats.recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <Badge color={a.passed ? 'green' : 'red'}>{a.passed ? '✓' : '✗'}</Badge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {a.student} — {a.exam}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                          {new Date(a.submit_time).toLocaleString()}
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: a.passed ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                        {parseFloat(a.percentage).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </Layout>
  );
};
