import EntityManager from '@/components/EntityManager';

export default function Children() {
  return (
    <EntityManager
      entityName="Child"
      title="ילדים"
      titleKey="full_name"
      subtitleKey="personal_goal"
      fields={[
        { key: 'full_name', label: 'שם מלא', type: 'text' },
        { key: 'age', label: 'גיל', type: 'number' },
        { key: 'personal_goal', label: 'יעד אישי', type: 'text' },
        { key: 'process_notes', label: 'הערות על התהליך', type: 'textarea' },
      ]}
      emptyMessage="עדיין אין ילדים רשומים"
    />
  );
}