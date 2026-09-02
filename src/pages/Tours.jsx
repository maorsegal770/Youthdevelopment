import EntityManager from '@/components/EntityManager';

export default function Tours() {
  return (
    <EntityManager
      entityName="Tour"
      title="סיורים יזומים"
      titleKey="title"
      subtitleKey="location"
      badgeKeys={['type']}
      fields={[
        { key: 'title', label: 'שם הסיור', type: 'text' },
        { key: 'type', label: 'סוג סיור', type: 'select', options: ['מוזיאון', 'טבע', 'מורשת', 'עסקים מקומיים'] },
        { key: 'date', label: 'תאריך', type: 'date' },
        { key: 'location', label: 'מיקום', type: 'text' },
        { key: 'notes', label: 'הערות', type: 'textarea' },
      ]}
      emptyMessage="עדיין אין סיורים מתוכננים"
    />
  );
}