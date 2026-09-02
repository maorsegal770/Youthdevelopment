import EntityManager from '@/components/EntityManager';

export default function Projects() {
  return (
    <EntityManager
      entityName="SharedProject"
      title="פרויקטים משותפים"
      titleKey="title"
      subtitleKey="location"
      badgeKeys={['status']}
      fields={[
        { key: 'title', label: 'שם הפרויקט', type: 'text' },
        { key: 'description', label: 'תיאור', type: 'textarea' },
        { key: 'location', label: 'מיקום', type: 'text' },
        { key: 'status', label: 'סטטוס', type: 'select', options: ['מתוכנן', 'בתהליך', 'הושלם'] },
      ]}
      emptyMessage="עדיין אין פרויקטים משותפים"
    />
  );
}