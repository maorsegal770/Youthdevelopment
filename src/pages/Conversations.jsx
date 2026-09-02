import EntityManager from '@/components/EntityManager';

export default function Conversations() {
  return (
    <EntityManager
      entityName="DeepConversation"
      title="שיחות עומק"
      titleKey="topic"
      badgeKeys={['type']}
      fields={[
        { key: 'topic', label: 'נושא לדיון', type: 'text' },
        { key: 'type', label: 'סוג שיחה', type: 'select', options: ['פרטנית', 'קבוצתית'] },
        { key: 'date', label: 'תאריך', type: 'date' },
        { key: 'participants', label: 'משתתפים', type: 'text' },
        { key: 'notes', label: 'תיעוד השיחה', type: 'textarea' },
      ]}
      emptyMessage="עדיין אין שיחות מתועדות"
    />
  );
}