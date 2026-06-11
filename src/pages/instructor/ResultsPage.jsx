import React, { useState, useEffect } from 'react';
import { reportsAPI, coursesAPI, examsAPI } from '../../services/api';
import {
  Layout, PageHeader, Card, Button, Alert, Spinner, Modal,
  FormField, Input, Select, Table, Badge, StatCard
} from '../../components/shared';

const AttemptDetailModal = ({ attemptId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    reportsAPI.attemptDetail(attemptId)
      .then(res => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [attemptId]);

  return (
    <Modal isOpen={!!attemptId} onClose={onClose} title="Attempt Details" width={700}>
      {loading ? <Spinner /> : !data ? <p>Failed to load details</p> : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              ['Student', data.attempt.student],
              ['Exam', data.attempt.exam],
              ['Course', data.attempt.course],
              ['Score', `${parseFloat(data.attempt.score || 0).toFixed(1)} / ${parseFloat(data.attempt.max_score || 0).toFixed(1)}`],
              ['Percentage', `${parseFloat(data.attempt.percentage || 0).toFixed(1)}%`],
              ['Result', <Badge color={data.attempt.passed ? 'green' : 'red'}>{data.attempt.passed ? 'PASSED' : 'FAILED'}</Badge>],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>

          <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Per-Question Performance</h4>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {data.answers.map((a, i) => (
              <div key={a.id} style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 8,
                background: a.is_correct ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${a.is_correct ? '#86efac' : '#fca5a5'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13 }}>Q{i + 1}: {a.question_text}</p>
                    <p style={{ margin: '2px 0', fontSize: 12, color: '#374151' }}>
                      Selected: <span style={{ fontWeight: 600 }}>{a.chosen_answer || 'Not answered'}</span>
                    </p>
                    {!a.is_correct && (
                      <p style={{ margin: '2px 0', fontSize: 12, color: '#10b981' }}>
                        Correct: <span style={{ fontWeight: 600 }}>{a.correct_answer}</span>
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Badge color={a.is_correct ? 'green' : 'red'}>{a.is_correct ? '✓ Correct' : '✗ Wrong'}</Badge>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      {parseFloat(a.points_earned || 0).toFixed(1)} / {parseFloat(a.max_points || 0).toFixed(1)} pts
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ student_id: '', course_id: '', exam_id: '', date_from: '', date_to: '' });
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    Promise.all([coursesAPI.getAll(), examsAPI.getAll()])
      .then(([cRes, eRes]) => { setCourses(cRes.data.data); setExams(eRes.data.data); });
  }, []);

  const load = () => {
    setLoading(true);
    const params = { ...filters, page, limit: 20 };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    reportsAPI.instructorResults(params)
      .then(res => {
        const { results, stats, pagination } = res.data.data;
        setResults(results);
        setStats(stats);
        setPagination(pagination);
      })
      .catch(() => setError('Failed to load results'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleFilter = (e) => { e.preventDefault(); setPage(1); load(); };

  const rows = results.map(r => [
    r.student,
    r.exam,
    r.course,
    `${parseFloat(r.score || 0).toFixed(1)} / ${parseFloat(r.max_score || 0).toFixed(1)}`,
    <span style={{ fontWeight: 700, color: parseFloat(r.percentage) >= 50 ? '#10b981' : '#ef4444' }}>
      {parseFloat(r.percentage || 0).toFixed(1)}%
    </span>,
    <Badge color={r.passed ? 'green' : 'red'}>{r.passed ? 'PASSED' : 'FAILED'}</Badge>,
    r.submit_time ? new Date(r.submit_time).toLocaleString() : '—',
    <Button variant="secondary" style={{ padding: '5px 12px', fontSize: 12 }}
      onClick={() => setSelectedAttempt(r.id)}>View</Button>
  ]);

  return (
    <Layout>
      <PageHeader title="Results" subtitle="All student exam attempts" />
      {error && <Alert message={error} onClose={() => setError('')} />}

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Attempts" value={stats.total} icon="✍️" />
          <StatCard label="Avg Score" value={`${stats.avgScore}%`} icon="📈" color="#06b6d4" />
          <StatCard label="Passed" value={stats.passCount} icon="✅" color="#10b981" />
          <StatCard label="Failed" value={stats.failCount} icon="❌" color="#ef4444" />
          <StatCard label="Pass Rate" value={`${stats.passRate}%`} icon="🏆" color="#f59e0b" />
        </div>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <form onSubmit={handleFilter}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Course</label>
              <Select value={filters.course_id} onChange={e => setFilters(f => ({ ...f, course_id: e.target.value }))}>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Exam</label>
              <Select value={filters.exam_id} onChange={e => setFilters(f => ({ ...f, exam_id: e.target.value }))}>
                <option value="">All Exams</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </Select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>From Date</label>
              <Input type="date" value={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>To Date</label>
              <Input type="date" value={filters.date_to} onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit">Apply Filters</Button>
            <Button variant="secondary" type="button" onClick={() => {
              setFilters({ student_id: '', course_id: '', exam_id: '', date_from: '', date_to: '' });
              setPage(1);
              setTimeout(load, 0);
            }}>Clear</Button>
          </div>
        </form>
      </Card>

      <Card>
        {loading ? <Spinner /> : (
          <>
            <Table
              headers={['Student', 'Exam', 'Course', 'Score', 'Percentage', 'Result', 'Submitted', 'Actions']}
              rows={rows}
              emptyMessage="No results found."
            />
            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                <span style={{ padding: '10px 16px', fontSize: 14, color: '#6b7280' }}>
                  Page {page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button variant="secondary" disabled={page * pagination.limit >= pagination.total}
                  onClick={() => setPage(p => p + 1)}>Next →</Button>
              </div>
            )}
          </>
        )}
      </Card>

      <AttemptDetailModal attemptId={selectedAttempt} onClose={() => setSelectedAttempt(null)} />
    </Layout>
  );
};
