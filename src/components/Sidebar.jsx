import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Lightbulb, Target, MessageCircle, Mic, Hammer, MapPin } from 'lucide-react';

const NAV = [
  { to: '/', label: 'דשבורד', icon: LayoutDashboard, end: true },
  { to: '/children', label: 'ילדים', icon: Users },
  { to: '/initiatives', label: 'יוזמות', icon: Lightbulb },
  { to: '/challenges', label: 'אתגרים', icon: Target },
  { to: '/conversations', label: 'שיחות עומק', icon: MessageCircle },
  { to: '/podcast', label: 'פודקאסט', icon: Mic },
  { to: '/projects', label: 'פרויקטים', icon: Hammer },
  { to: '/tours', label: 'סיורים', icon: MapPin },
];

export default function Sidebar({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {NAV.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}