import React, { useState, useEffect } from 'react';
import { coursesAPI, questionBankAPI } from '../../services/api';
import {
  Layout, PageHeader, Card, Button, Alert, Spinner, Modal, ConfirmModal,
  FormField, Input, Select, Textarea, Table, Badge
} from '../../components/shared';

const QuestionForm = ({ initial, onSave, onCancel, loading }) => {
  const empty = { text: '', points: 1, difficulty: 'medium', topic: '', choices: [
    { text: '', is_correct: true }, { text: '', is_correct: false },
    { text: '', is_correct: false }, { text: '', is_correct: false }
  ]};
  const [form, setForm] = useState(initial || empty);
  const [error, setError] = useState('');

  const setChoice = (i, field, value) => {
    setForm(f => {
      const choices = [...f.choices];
      if (field === 'is_correct') {
        choices.forEach((c, idx) => c.is_correct = idx === i);
      } else {
        choices[i] = { ...choices[i], [field]: value };
      }
      return { ...f, choices };
    });
  };

  const addChoice = () => {
    if (form.choices.length >= 5) return;
    setForm(f => ({ ...f, choices: [...f.choices, { text: '', is_correct: false }] }));
  };

  const removeChoice = (i) => {
    if (form.choices.length <= 2) return;
    setForm(f => {
      const choices = f.choices.filter((_, idx) => idx !== i);
      if (!choices.some(c => c.is_correct)) choices[0].is_correct = true;
      return { ...f, choices };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return setError('Question text is required');
    if (form.choices.some(c => !c.text.trim())) return setError('All choice texts are required');
    if (!form.choices.some(c => c.is_correct)) return setError('Select one correct answer');
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert message={error} onClose={() => setError('')} />}
      <FormField label="Question Text" required>
        <Textarea value={form.text} placeholder="Enter your question..."
          onChange={e => setForm(f => ({ ...f, text: e.target.value }))} style={{ minHeight: 80 }} />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <FormField label="Points" required>
          <Input type="number" value={form.points} min={0.5} step={0.5}
            onChange={e => setForm(f => ({ ...f, points: parseFloat(e.target.value) || 1 }))} />
        </FormField>
        <FormField label="Difficulty">
          <Select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </FormField>
        <FormField label="Topic">
          <Input value={form.topic || ''} placeholder="e.g., Algebra"
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
        </FormField>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Answer Choices <span style={{ color: '#ef4444' }}>*</span></label>
          {form.choices.length < 5 && (
            <Button variant="secondary" onClick={addChoice} type="button" style={{ padding: '4px 12px', fontSize: 13 }}>
              + Add Choice
            </Button>
          )}
        </div>
        {form.choices.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <input type="radio" name="correct" checked={c.is_correct}
              onChange={() => setChoice(i, 'is_correct', true)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#10b981', flexShrink: 0 }} />
            <Input value={c.text} placeholder={`Choice ${i + 1}`}
              onChange={e => setChoice(i, 'text', e.target.value)}
              style={{ flex: 1, border: c.is_correct ? '2px solid #10b981' : undefined }} />
            {form.choices.length > 2 && (
              <button onClick={() => removeChoice(i)} type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 20, padding: '0 4px', flexShrink: 0 }}>
                ×
              </button>
            )}
          </div>
        ))}
        <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0' }}>
          ○ Select the radio button next to the correct answer
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Question'}</Button>
      </div>
    </form>
  );
};

export const QuestionBankPage = () => {
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesAPI.getAll()
      .then(res => {
        setCourses(res.data.data);
        if (res.data.data.length > 0) setSelectedCourse(String(res.data.data[0].id));
      })
      .catch(() => setError('Failed to load courses'))
      .finally(() => setCoursesLoading(false));
  }, []);

  const loadQuestions = () => {
    if (!selectedCourse) return;
    setLoading(true);
    const params = {};
    if (filterDifficulty) params.difficulty = filterDifficulty;
    if (filterTopic) params.topic = filterTopic;
    questionBankAPI.getByCourse(selectedCourse, params)
      .then(res => setQuestions(res.data.data))
      .catch(() => setError('Failed to load questions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadQuestions(); }, [selectedCourse, filterDifficulty, filterTopic]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await questionBankAPI.update(editing.id, form);
        setSuccess('Question updated');
      } else {
        await questionBankAPI.create(selectedCourse, form);
        setSuccess('Question created');
      }
      setShowForm(false); setEditing(null);
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await questionBankAPI.delete(deleting.id);
      setSuccess('Question deleted');
      setDeleting(null);
      loadQuestions();
    } catch { setError('Delete failed'); }
  };

  const diffColor = { easy: 'green', medium: 'yellow', hard: 'red' };

  const rows = questions.map(q => [
    <div style={{ maxWidth: 320, fontSize: 13 }}>{q.text}</div>,
    <Badge color={diffColor[q.difficulty] || 'gray'}>{q.difficulty}</Badge>,
    q.topic ? <Badge color="blue">{q.topic}</Badge> : <span style={{ color: '#9ca3af' }}>—</span>,
    <span style={{ fontWeight: 600 }}>{q.points} pts</span>,
    <span>{q.choices?.length || 0} choices</span>,
    <Badge color="purple">{q.used_in_exams || 0} exams</Badge>,
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" style={{ padding: '5px 12px', fontSize: 12 }}
        onClick={() => {
          const initial = { ...q, choices: (q.choices || []).map(c => ({ text: c.text, is_correct: c.is_correct })) };
          setEditing(initial); setShowForm(true);
        }}>Edit</Button>
      <Button variant="danger" style={{ padding: '5px 12px', fontSize: 12 }}
        onClick={() => setDeleting(q)}>Delete</Button>
    </div>
  ]);

  return (
    <Layout>
      <PageHeader
        title="Question Bank"
        subtitle="Manage reusable questions per course"
        actions={
          selectedCourse && (
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>+ New Question</Button>
          )
        }
      />
      {error && <Alert message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Course:</span>
            <Select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ width: 220 }}>
              {coursesLoading ? <option>Loading...</option> : courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Difficulty:</span>
            <Select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} style={{ width: 140 }}>
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Topic:</span>
            <Input value={filterTopic} placeholder="Filter by topic..."
              onChange={e => setFilterTopic(e.target.value)} style={{ width: 160 }} />
          </div>
        </div>
      </Card>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Question', 'Difficulty', 'Topic', 'Points', 'Choices', 'Used In', 'Actions']}
            rows={rows}
            emptyMessage={selectedCourse ? 'No questions yet for this course.' : 'Select a course to see its questions.'}
          />
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Question' : 'New Question'} width={640}>
        <QuestionForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          loading={saving}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Delete Question"
        message={`Delete this question? It will be removed from all exams that use it.`}
      />
    </Layout>
  );
};
