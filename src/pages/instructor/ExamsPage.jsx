import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, examsAPI } from '../../services/api';
import {
  Layout, PageHeader, Card, Button, Alert, Spinner, Modal, ConfirmModal,
  FormField, Input, Select, Textarea, Table, Badge
} from '../../components/shared';

const ExamForm = ({ initial, courses, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || {
    title: '', description: '', course_id: '', time_limit: 60, passing_score: 50
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Exam title is required');
    if (!form.course_id) return setError('Please select a course');
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert message={error} onClose={() => setError('')} />}
      <FormField label="Exam Title" required>
        <Input value={form.title} placeholder="e.g., Midterm Exam"
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </FormField>
      <FormField label="Course" required>
        <Select value={form.course_id} disabled={!!initial}
          onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
          <option value="">Select a course...</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FormField>
      <FormField label="Description">
        <Textarea value={form.description || ''} placeholder="Exam description..."
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormField label="Time Limit (minutes)" required>
          <Input type="number" value={form.time_limit} min={1} max={480}
            onChange={e => setForm(f => ({ ...f, time_limit: parseInt(e.target.value) || 60 }))} />
        </FormField>
        <FormField label="Passing Score (%)" required>
          <Input type="number" value={form.passing_score} min={1} max={100}
            onChange={e => setForm(f => ({ ...f, passing_score: parseFloat(e.target.value) || 50 }))} />
        </FormField>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Exam'}</Button>
      </div>
    </form>
  );
};

export const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([
      examsAPI.getAll(courseFilter || undefined),
      coursesAPI.getAll()
    ]).then(([exRes, cRes]) => {
      setExams(exRes.data.data);
      setCourses(cRes.data.data);
    }).catch(() => setError('Failed to load data'))
    .finally(() => setLoading(false));
  };

  useEffect(load, [courseFilter]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await examsAPI.update(editing.id, form);
        setSuccess('Exam updated');
      } else {
        await examsAPI.create(form);
        setSuccess('Exam created');
      }
      setShowForm(false); setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await examsAPI.delete(deleting.id);
      setSuccess('Exam deleted');
      setDeleting(null);
      load();
    } catch (err) { setError('Delete failed'); }
  };

  const rows = exams.map(e => [
    <strong>{e.title}</strong>,
    e.course_name,
    `${e.time_limit} min`,
    `${e.passing_score}%`,
    <Badge color="blue">{e.question_count || 0} questions</Badge>,
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="warning" style={{ padding: '6px 12px', fontSize: 12 }}
        onClick={() => navigate(`/instructor/exam-builder/${e.id}`)}>
        🔨 Builder
      </Button>
      <Button variant="secondary" style={{ padding: '6px 12px', fontSize: 12 }}
        onClick={() => { setEditing(e); setShowForm(true); }}>Edit</Button>
      <Button variant="danger" style={{ padding: '6px 12px', fontSize: 12 }}
        onClick={() => setDeleting(e)}>Delete</Button>
    </div>
  ]);

  return (
    <Layout>
      <PageHeader
        title="Exam Management"
        subtitle="Create and manage examinations"
        actions={<Button onClick={() => { setEditing(null); setShowForm(true); }}>+ New Exam</Button>}
      />
      {error && <Alert message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Filter by Course:</span>
          <Select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ maxWidth: 280 }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            headers={['Title', 'Course', 'Duration', 'Pass Score', 'Questions', 'Actions']}
            rows={rows}
            emptyMessage="No exams yet. Create your first exam!"
          />
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Exam' : 'New Exam'} width={560}>
        <ExamForm
          initial={editing} courses={courses}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          loading={saving}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        title="Delete Exam"
        message={`Delete "${deleting?.title}"? All student attempts for this exam will also be deleted.`}
      />
    </Layout>
  );
};
