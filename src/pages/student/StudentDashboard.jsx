import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, examsAPI } from '../../services/api';
import {
  Layout, PageHeader, Card, Button, Alert, Spinner, Badge, Select
} from '../../components/shared';

export const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    coursesAPI.getAll()
      .then(res => {
        console.log('Courses response:', res);
        setCourses(res.data.data);
        if (res.data.data.length > 0) setSelectedCourse(String(res.data.data[0].id));
      })
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    examsAPI.getAll(selectedCourse)
      .then(res => setExams(res.data.data))
      .catch(() => setError('Failed to load exams'));
  }, [selectedCourse]);

  const startExam = (examId) => navigate(`/student/exam/${examId}`);

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <PageHeader title="Student Dashboard" subtitle="Browse courses and take examinations" />
      {error && <Alert message={error} onClose={() => setError('')} />}

      {/* Course Selector */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>📚 Select a Course</h3>
        {courses.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No courses available yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {courses.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCourse(String(c.id))}
                style={{
                  padding: '16px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${selectedCourse === String(c.id) ? '#4f46e5' : '#e5e7eb'}`,
                  background: selectedCourse === String(c.id) ? '#eff6ff' : '#fff',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>📚</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
                {c.description && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, lineHeight: 1.4 }}>
                    {c.description.length > 80 ? c.description.slice(0, 80) + '…' : c.description}
                  </div>
                )}
                <Badge color="blue">{c.exam_count || 0} exams</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Exams for selected course */}
      {selectedCourse && (
        <Card>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>
            📝 Available Examinations — {courses.find(c => String(c.id) === selectedCourse)?.name}
          </h3>
          {exams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ margin: 0 }}>No exams available for this course yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {exams.map(exam => (
                <div key={exam.id} style={{
                  border: '1px solid #e5e7eb', borderRadius: 12, padding: 20,
                  background: '#fff', transition: 'box-shadow 0.15s'
                }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>{exam.title}</h4>
                  {exam.description && (
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280', lineHeight: 1.4 }}>
                      {exam.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <Badge color="blue">⏱ {exam.time_limit} min</Badge>
                    <Badge color="yellow">🎯 Pass: {exam.passing_score}%</Badge>
                    <Badge color="gray">❓ {exam.question_count || 0} questions</Badge>
                  </div>
                  <Button
                    onClick={() => startExam(exam.id)}
                    disabled={parseInt(exam.question_count) === 0}
                    style={{ width: '100%' }}
                  >
                    {parseInt(exam.question_count) === 0 ? 'No Questions Yet' : '🚀 Start Exam'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </Layout>
  );
};
