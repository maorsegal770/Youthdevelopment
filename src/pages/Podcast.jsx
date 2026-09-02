import EntityManager from '@/components/EntityManager';

export default function Podcast() {
  return (
    <EntityManager
      entityName="PodcastEpisode"
      title="פודקאסט חברותא"
      titleKey="title"
      badgeKeys={['topic']}
      fields={[
        { key: 'title', label: 'שם הפרק', type: 'text' },
        { key: 'topic', label: 'נושא', type: 'select', options: ['רצון', 'מחשבה', 'רגש', 'מעשה'] },
        { key: 'date', label: 'תאריך', type: 'date' },
        { key: 'participants', label: 'משתתפים', type: 'text' },
        { key: 'notes', label: 'תיעוד', type: 'textarea' },
      ]}
      emptyMessage="עדיין אין פרקים מוקלטים"
    />
  );
}