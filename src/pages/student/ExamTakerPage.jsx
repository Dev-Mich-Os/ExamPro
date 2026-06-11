import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examsAPI, attemptsAPI } from '../../services/api';
import { Layout, Button, Alert, Spinner, Card } from '../../components/shared';

// ── TIMER ──────────────────────────────────────────────────────
const Timer = ({ endTime, onExpire }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endTime) - Date.now());
      setRemaining(diff);
      if (diff === 0) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, onExpire]);

  const totalSeconds = Math.floor(remaining / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = n => String(n).padStart(2, '0');

  const isRed = remaining < 60000;
  const isOrange = !isRed && remaining < 300000;
  const color = isRed ? '#ef4444' : isOrange ? '#f59e0b' : '#10b981';

  return (
    <div style={{
      background: isRed ? '#fef2f2' : isOrange ? '#fffbeb' : '#f0fdf4',
      border: `2px solid ${color}`, borderRadius: 12,
      padding: '12px 20px', textAlign: 'center', minWidth: 140
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: 1 }}>
        Time Remaining
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'monospace', marginTop: 4 }}>
        {h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(s)}
      </div>
      {isRed && <div style={{ fontSize: 11, color, marginTop: 2 }}>⚠ Almost out of time!</div>}
    </div>
  );
};

export const ExamTakerPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('confirm'); // confirm | taking | submitting
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: choiceId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitFired = useRef(false);

  useEffect(() => {
    examsAPI.getForStudent(examId)
      .then(res => setExam(res.data.data))
      .catch(() => setError('Failed to load exam'))
      .finally(() => setLoading(false));
  }, [examId]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await attemptsAPI.start(examId);
      setAttempt(res.data.data);

      // Load any already-saved answers (if continuing)
      const aRes = await attemptsAPI.get(res.data.data.id);
      const saved = {};
      (aRes.data.data.saved_answers || []).forEach(a => {
        if (a.choice_id) saved[a.question_id] = a.choice_id;
      });
      setAnswers(saved);
      setStep('taking');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start exam');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = async (questionId, choiceId) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    try {
      await attemptsAPI.saveAnswer(attempt.id, { question_id: questionId, choice_id: choiceId });
    } catch (err) {
      const d = err.response?.data;
      if (d?.data?.auto_submitted) {
        navigate(`/student/results/${attempt.id}`);
      }
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitFired.current || !attempt) return;
    autoSubmitFired.current = true;
    try {
      await attemptsAPI.autoSubmit(attempt.id);
      navigate(`/student/results/${attempt.id}`);
    } catch {
      navigate(`/student/results/${attempt.id}`);
    }
  }, [attempt, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await attemptsAPI.submit(attempt.id);
      navigate(`/student/results/${attempt.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;
  if (!exam) return <Layout><Alert message="Exam not found" /></Layout>;

  const questions = exam.questions || [];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const q = questions[currentQ];

  // ── CONFIRM SCREEN ─────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <Layout>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📝</div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{exam.title}</h2>
              <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{exam.course_name}</p>
            </div>
            {error && <Alert message={error} onClose={() => setError('')} />}
            {exam.description && (
              <p style={{ background: '#f9fafb', borderRadius: 8, padding: 16, fontSize: 14, lineHeight: 1.6 }}>
                {exam.description}
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, margin: '24px 0' }}>
              {[
                { icon: '❓', label: 'Questions', value: totalQ },
                { icon: '⏱', label: 'Time Limit', value: `${exam.time_limit} min` },
                { icon: '🎯', label: 'Pass Score', value: `${exam.passing_score}%` },
              ].map(item => (
                <div key={item.label} style={{
                  textAlign: 'center', padding: '16px 12px', background: '#f9fafb', borderRadius: 10
                }}>
                  <div style={{ fontSize: 28 }}>{item.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{
              background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: 14, marginBottom: 24
            }}>
              <p style={{ margin: 0, fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
                ⚠️ <strong>Important:</strong> Once you start, the timer begins immediately.
                The exam will auto-submit when time runs out. Answer all questions before submitting manually.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="secondary" onClick={() => navigate('/student')} style={{ flex: 1 }}>← Back</Button>
              <Button onClick={handleStart} style={{ flex: 2 }}>🚀 Start Exam</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // ── TAKING SCREEN ──────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        background: '#1e1b4b', color: '#fff', padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{exam.title}</div>
          <div style={{ fontSize: 12, color: '#a5b4fc' }}>{exam.course_name}</div>
        </div>
        {attempt?.end_time && (
          <Timer endTime={attempt.end_time} onExpire={handleAutoSubmit} />
        )}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: '#c7d2fe' }}>Answered</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{answeredCount}/{totalQ}</div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', display: 'flex', gap: 20 }}>
        {/* Question Navigator */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <Card style={{ padding: 16, position: 'sticky', top: 90 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
              Questions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {questions.map((question, i) => {
                const isAnswered = !!answers[question.id];
                const isCurrent = i === currentQ;
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQ(i)}
                    style={{
                      aspectRatio: '1', border: 'none', borderRadius: 6, cursor: 'pointer',
                      fontWeight: 700, fontSize: 12,
                      background: isCurrent ? '#4f46e5' : isAnswered ? '#10b981' : '#e5e7eb',
                      color: isCurrent || isAnswered ? '#fff' : '#374151',
                      outline: isCurrent ? '2px solid #a5b4fc' : 'none'
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: '#10b981' }} />
                <span style={{ color: '#6b7280' }}>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: '#e5e7eb' }} />
                <span style={{ color: '#6b7280' }}>Unanswered</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Area */}
        <div style={{ flex: 1 }}>
          {error && <Alert message={error} onClose={() => setError('')} />}
          {q && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                  Question {currentQ + 1} of {totalQ}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {q.points} point{q.points !== 1 ? 's' : ''}
                  {q.difficulty && <span style={{ marginLeft: 8, textTransform: 'capitalize' }}>• {q.difficulty}</span>}
                  {q.topic && <span style={{ marginLeft: 8 }}>• {q.topic}</span>}
                </div>
              </div>

              <div style={{ width: '100%', height: 4, background: '#e5e7eb', borderRadius: 2, marginBottom: 24 }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: '#4f46e5',
                  width: `${((currentQ + 1) / totalQ) * 100}%`, transition: 'width 0.3s'
                }} />
              </div>

              <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, marginBottom: 24, color: '#111827' }}>
                {q.text}
              </p>

              <div>
                {(q.choices || []).map((choice, i) => {
                  const isSelected = answers[q.id] === choice.id;
                  return (
                    <div
                      key={choice.id}
                      onClick={() => handleSelectAnswer(q.id, choice.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 18px', borderRadius: 10, marginBottom: 10, cursor: 'pointer',
                        border: `2px solid ${isSelected ? '#4f46e5' : '#e5e7eb'}`,
                        background: isSelected ? '#eff6ff' : '#fff',
                        transition: 'all 0.15s', userSelect: 'none'
                      }}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14,
                        background: isSelected ? '#4f46e5' : '#f3f4f6',
                        color: isSelected ? '#fff' : '#374151',
                      }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ fontSize: 15, lineHeight: 1.5 }}>{choice.text}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
                <Button variant="secondary" disabled={currentQ === 0}
                  onClick={() => setCurrentQ(i => i - 1)}>← Previous</Button>
                {currentQ < totalQ - 1 ? (
                  <Button onClick={() => setCurrentQ(i => i + 1)}>Next →</Button>
                ) : (
                  <Button variant="success"
                    disabled={answeredCount < totalQ || submitting}
                    onClick={handleSubmit}>
                    {submitting ? 'Submitting...' : `✓ Submit Exam (${answeredCount}/${totalQ} answered)`}
                  </Button>
                )}
              </div>
              {currentQ === totalQ - 1 && answeredCount < totalQ && (
                <p style={{ textAlign: 'center', color: '#f59e0b', fontSize: 13, marginTop: 12 }}>
                  ⚠ Please answer all {totalQ - answeredCount} remaining question(s) before submitting.
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
