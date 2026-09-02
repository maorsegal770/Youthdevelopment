import EntityManager from '@/components/EntityManager';

export default function Initiatives() {
  return (
    <EntityManager
      entityName="Initiative"
      title="יוזמות אישיות"
      titleKey="title"
      subtitleKey="child_name"
      badgeKeys={['status']}
      fields={[
        { key: 'title', label: 'שם היוזמה', type: 'text' },
        { key: 'child_name', label: 'שם הילד/ה', type: 'text' },
        { key: 'description', label: 'תיאור הרעיון', type: 'textarea' },
        { key: 'status', label: 'סטטוס', type: 'select', options: ['רעיון', 'בתהליך', 'הוגשם'] },
        { key: 'mentor_notes', label: 'הערות מלווה', type: 'textarea' },
      ]}
      emptyMessage="עדיין אין יוזמות. הוסף את הרעיון הראשון"
    />
  );
}