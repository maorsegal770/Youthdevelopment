import EntityManager from '@/components/EntityManager';

export default function Challenges() {
  return (
    <EntityManager
      entityName="Challenge"
      title="אתגרים"
      titleKey="title"
      badgeKeys={['type', 'status']}
      fields={[
        { key: 'title', label: 'שם האתגר', type: 'text' },
        { key: 'type', label: 'סוג אתגר', type: 'select', options: ['חשיבה', 'בנייה', 'משימה קבוצתית'] },
        { key: 'description', label: 'תיאור', type: 'textarea' },
        { key: 'date', label: 'תאריך', type: 'date' },
        { key: 'status', label: 'סטטוס', type: 'select', options: ['מתוכנן', 'בוצע'] },
        { key: 'participants', label: 'משתתפים', type: 'text' },
      ]}
      emptyMessage="עדיין אין אתגרים מתוכננים"
    />
  );
}