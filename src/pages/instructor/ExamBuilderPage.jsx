import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examsAPI, questionBankAPI } from '../../services/api';
import {
  Layout, PageHeader, Card, Button, Alert, Spinner, Badge, Modal
} from '../../components/shared';

export const ExamBuilderPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('exam');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewQ, setPreviewQ] = useState(null);

  const loadAll = async () => {
    try {
      const [examRes, eqRes, bqRes] = await Promise.all([
        examsAPI.getAll(),
        questionBankAPI.getExamQuestions(examId),
        questionBankAPI.getAvailableForExam(examId),
      ]);
      const found = examRes.data.data.find(e => String(e.id) === String(examId));
      setExam(found);
      setExamQuestions(eqRes.data.data);
      setBankQuestions(bqRes.data.data);
    } catch {
      setError('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [examId]);

  const addToExam = async (questionId) => {
    try {
      await questionBankAPI.addToExam(examId, questionId);
      setSuccess('Question added to exam');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };

  const removeFromExam = async (questionId) => {
    try {
      await questionBankAPI.removeFromExam(examId, questionId);
      setSuccess('Question removed from exam');
      await loadAll();
    } catch {
      setError('Failed to remove question');
    }
  };

  const diffColor = { easy: 'green', medium: 'yellow', hard: 'red' };

  const QuestionCard = ({ q, action }) => (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 12,
      background: '#fafafa', transition: 'border-color 0.15s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 14, lineHeight: 1.5 }}>
            {q.text.length > 120 ? q.text.slice(0, 120) + '…' : q.text}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge color={diffColor[q.difficulty]}>{q.difficulty}</Badge>
            {q.topic && <Badge color="blue">{q.topic}</Badge>}
            <Badge color="gray">{q.choices?.length || 0} choices</Badge>
            <Badge color="purple">{q.points_override || q.points} pts</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Button variant="secondary" style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setPreviewQ(q)}>Preview</Button>
          {action}
        </div>
      </div>
    </div>
  );

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <PageHeader
        title={`Exam Builder: ${exam?.title || 'Loading...'}`}
        subtitle={`Course: ${exam?.course_name || ''} | ${examQuestions.length} questions | ${exam?.time_limit} min`}
        actions={<Button variant="secondary" onClick={() => navigate('/instructor/exams')}>← Back to Exams</Button>}
      />
      {error && <Alert message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #e5e7eb' }}>
        {[
          { id: 'exam', label: `📝 Exam Questions (${examQuestions.length})` },
          { id: 'bank', label: `🗄️ Question Bank (${bankQuestions.length} available)` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '12px 24px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            background: 'none', borderBottom: activeTab === tab.id ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === tab.id ? '#4f46e5' : '#6b7280', marginBottom: -2
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'exam' && (
        <Card>
          {examQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ margin: 0 }}>No questions in this exam yet.</p>
              <p style={{ margin: '8px 0 0' }}>Switch to the Question Bank tab to add questions.</p>
            </div>
          ) : (
            examQuestions.map((q, i) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontWeight: 700, color: '#9ca3af', paddingTop: 18, minWidth: 28 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <QuestionCard q={q} action={
                    <Button variant="danger" style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => removeFromExam(q.id)}>Remove</Button>
                  } />
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {activeTab === 'bank' && (
        <Card>
          {bankQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗄️</div>
              <p style={{ margin: 0 }}>All questions from the bank are already in this exam,</p>
              <p style={{ margin: '8px 0 0' }}>or there are no questions in the bank for this course yet.</p>
              <Button style={{ marginTop: 16 }} onClick={() => navigate('/instructor/questions')}>
                Go to Question Bank
              </Button>
            </div>
          ) : (
            bankQuestions.map(q => (
              <QuestionCard key={q.id} q={q} action={
                <Button variant="success" style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => addToExam(q.id)}>+ Add</Button>
              } />
            ))
          )}
        </Card>
      )}

      {/* Question Preview Modal */}
      <Modal isOpen={!!previewQ} onClose={() => setPreviewQ(null)} title="Question Preview" width={560}>
        {previewQ && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Badge color={diffColor[previewQ.difficulty]}>{previewQ.difficulty}</Badge>
              {previewQ.topic && <Badge color="blue">{previewQ.topic}</Badge>}
              <Badge color="purple">{previewQ.points_override || previewQ.points} points</Badge>
            </div>
            <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
              {previewQ.text}
            </p>
            <div>
              {(previewQ.choices || []).map((c, i) => (
                <div key={c.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderRadius: 8, marginBottom: 8,
                  background: c.is_correct ? '#f0fdf4' : '#f9fafb',
                  border: `1px solid ${c.is_correct ? '#86efac' : '#e5e7eb'}`
                }}>
                  <span style={{ fontWeight: 700, color: c.is_correct ? '#10b981' : '#9ca3af' }}>
                    {c.is_correct ? '✓' : String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ fontSize: 14 }}>{c.text}</span>
                  {c.is_correct && <Badge color="green">Correct</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
