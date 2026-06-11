import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportsAPI } from '../../services/api';
import { Layout, PageHeader, Card, Button, Alert, Spinner, Badge, Modal, Table } from '../../components/shared';

// ── IMMEDIATE RESULTS (after exam submission) ──────────────────
export const ExamResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    reportsAPI.studentAttemptDetail(attemptId)
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load results'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <Layout><Spinner /></Layout>;
  if (error || !data) return <Layout><Alert message={error || 'Result not found'} /></Layout>;

  const { attempt, answers } = data;
  const pct = parseFloat(attempt.percentage || 0).toFixed(1);
  const passed = attempt.passed;

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Result Banner */}
        <Card style={{
          textAlign: 'center', marginBottom: 24,
          background: passed
            ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
            : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
          border: `2px solid ${passed ? '#86efac' : '#fca5a5'}`
        }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>{passed ? '🎉' : '😞'}</div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: passed ? '#15803d' : '#b91c1c' }}>
            {passed ? 'Congratulations! You Passed!' : 'Not Quite There — Try Again!'}
          </h2>
          <p style={{ margin: '8px 0 0', color: passed ? '#166534' : '#991b1b', fontSize: 15 }}>
            {attempt.exam} · {attempt.course}
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 120, height: 120, borderRadius: '50%', margin: '24px auto',
            background: passed ? '#15803d' : '#b91c1c', color: '#fff'
          }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Score</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Points Earned', value: `${parseFloat(attempt.score || 0).toFixed(1)} / ${parseFloat(attempt.max_score || 0).toFixed(1)}` },
              { label: 'Passing Score', value: `${attempt.passing_score}%` },
              { label: 'Result', value: passed ? 'PASSED ✓' : 'FAILED ✗' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => setShowDetails(true)}>📋 Review Answers</Button>
            <Button onClick={() => navigate('/student')}>🏠 Back to Dashboard</Button>
            <Button variant="secondary" onClick={() => navigate('/student/history')}>📊 View History</Button>
          </div>
        </Card>

        {/* Quick Answer Summary */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Quick Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Correct Answers', value: answers.filter(a => a.is_correct).length, color: '#10b981' },
              { label: 'Wrong Answers', value: answers.filter(a => !a.is_correct).length, color: '#ef4444' },
            ].map(item => (
              <div key={item.label} style={{
                textAlign: 'center', padding: 20, borderRadius: 10,
                background: `${item.color}15`, border: `1px solid ${item.color}40`
              }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Answer Review Modal */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} title="Answer Review" width={680}>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {answers.map((a, i) => (
            <div key={a.id} style={{
              padding: '14px 16px', borderRadius: 10, marginBottom: 12,
              background: a.is_correct ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${a.is_correct ? '#86efac' : '#fca5a5'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, lineHeight: 1.5, flex: 1 }}>
                  Q{i + 1}: {a.question_text}
                </p>
                <Badge color={a.is_correct ? 'green' : 'red'}>
                  {a.is_correct ? '✓ Correct' : '✗ Wrong'}
                </Badge>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: a.all_choices ? 10 : 0 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  Your answer: <strong>{a.chosen_answer || 'Not answered'}</strong>
                </span>
                {!a.is_correct && a.correct_answer && (
                  <span style={{ fontSize: 12, color: '#10b981' }}>
                    | Correct: <strong>{a.correct_answer}</strong>
                  </span>
                )}
              </div>
              {/* All choices */}
              {a.all_choices && (
                <div style={{ display: 'flex', gap: 6, flexDirection: 'column', marginTop: 8 }}>
                  {a.all_choices.map((c, ci) => (
                    <div key={c.id || ci} style={{
                      fontSize: 13, padding: '6px 12px', borderRadius: 6,
                      background: c.is_correct ? '#dcfce7' : (a.chosen_answer === c.text && !a.is_correct) ? '#fee2e2' : '#f9fafb',
                      border: `1px solid ${c.is_correct ? '#86efac' : '#e5e7eb'}`,
                      display: 'flex', justifyContent: 'space-between'
                    }}>
                      <span>{c.text}</span>
                      {c.is_correct && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Correct</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

// ── RESULTS HISTORY ────────────────────────────────────────────
export const ResultsHistoryPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    reportsAPI.studentResults()
      .then(res => setResults(res.data.data))
      .catch(() => setError('Failed to load results history'))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (attemptId) => {
    setSelectedAttempt(attemptId);
    setDetailLoading(true);
    try {
      const res = await reportsAPI.studentAttemptDetail(attemptId);
      setDetailData(res.data.data);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Stats
  const totalAttempts = results.length;
  const passed = results.filter(r => r.passed).length;
  const avgScore = totalAttempts > 0
    ? (results.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) / totalAttempts).toFixed(1)
    : '0.0';

  const rows = results.map(r => [
    r.exam,
    r.course,
    <span style={{ fontWeight: 700, color: parseFloat(r.percentage) >= parseFloat(r.passing_score || 50) ? '#10b981' : '#ef4444' }}>
      {parseFloat(r.percentage || 0).toFixed(1)}%
    </span>,
    `${parseFloat(r.score || 0).toFixed(1)} / ${parseFloat(r.max_score || 0).toFixed(1)}`,
    <Badge color={r.passed ? 'green' : 'red'}>{r.passed ? '✓ PASSED' : '✗ FAILED'}</Badge>,
    r.submit_time ? new Date(r.submit_time).toLocaleString() : '—',
    <Button variant="secondary" style={{ padding: '5px 12px', fontSize: 12 }}
      onClick={() => openDetail(r.id)}>Review</Button>
  ]);

  return (
    <Layout>
      <PageHeader title="My Results History" subtitle="Review your past exam attempts" />
      {error && <Alert message={error} onClose={() => setError('')} />}

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Attempts', value: totalAttempts, icon: '✍️', color: '#4f46e5' },
          { label: 'Passed', value: passed, icon: '✅', color: '#10b981' },
          { label: 'Failed', value: totalAttempts - passed, icon: '❌', color: '#ef4444' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: '📈', color: '#06b6d4' },
        ].map(s => (
          <Card key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: `${s.color}18`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, flexShrink: 0
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Exam', 'Course', 'Score %', 'Points', 'Result', 'Submitted', 'Actions']}
            rows={rows}
            emptyMessage="No exam attempts yet. Take an exam from your dashboard!"
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedAttempt} onClose={() => { setSelectedAttempt(null); setDetailData(null); }}
        title="Exam Review" width={680}>
        {detailLoading ? <Spinner /> : !detailData ? <p style={{ color: '#9ca3af' }}>No data available.</p> : (
          <div>
            <div style={{
              padding: '14px 18px', borderRadius: 10, marginBottom: 20,
              background: detailData.attempt.passed ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${detailData.attempt.passed ? '#86efac' : '#fca5a5'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{detailData.attempt.exam}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{detailData.attempt.course}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: detailData.attempt.passed ? '#15803d' : '#b91c1c' }}>
                    {parseFloat(detailData.attempt.percentage || 0).toFixed(1)}%
                  </div>
                  <Badge color={detailData.attempt.passed ? 'green' : 'red'}>
                    {detailData.attempt.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
              </div>
            </div>

            <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              {detailData.answers.map((a, i) => (
                <div key={a.id} style={{
                  padding: '12px 14px', borderRadius: 8, marginBottom: 10,
                  background: a.is_correct ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${a.is_correct ? '#86efac' : '#fca5a5'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, flex: 1, lineHeight: 1.4 }}>
                      Q{i + 1}: {a.question_text}
                    </p>
                    <Badge color={a.is_correct ? 'green' : 'red'}>{a.is_correct ? '✓' : '✗'}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151' }}>
                    Your answer: <strong>{a.chosen_answer || 'Not answered'}</strong>
                    {!a.is_correct && a.correct_answer && (
                      <span style={{ marginLeft: 12, color: '#10b981' }}>
                        Correct: <strong>{a.correct_answer}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
