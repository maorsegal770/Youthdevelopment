import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Lightbulb, Target, MessageCircle, Mic, Hammer, MapPin, Sparkles, Heart, TreePine } from 'lucide-react';

const GOALS = [
  { icon: Sparkles, title: 'גילוי עצמי', desc: 'גילוי העונג הפנימי. שטוב לי עם עצמי והסביבה ללא תלות בהישגים.' },
  { icon: Heart, title: 'הכרה בערך העצמי', desc: 'השגת ביטחון עצמי ויעדים אישיים וקבוצתיים.' },
  { icon: TreePine, title: 'התפתחות העולם הפנימי', desc: 'ומתוכו צמיחה בעולם החיצוני.' },
];

const METHODS = [
  { icon: Target, title: 'אתגרים', desc: 'אתגרי חשיבה, בנייה ומשימות קבוצתיות', to: '/challenges', color: 'text-violet-600 bg-violet-50' },
  { icon: MessageCircle, title: 'שיחות עומק', desc: 'שאלות עומק לדיון קבוצתי ושיחות פרטניות', to: '/conversations', color: 'text-cyan-600 bg-cyan-50' },
  { icon: Mic, title: 'פודקאסט חברותא', desc: 'שיחות על רצון, מחשבה, רגש ומעשה', to: '/podcast', color: 'text-rose-600 bg-rose-50' },
  { icon: Lightbulb, title: 'הגשמת רעיונות', desc: 'ליווי אישי של כל ילד/ה ביוזמה שלו/ה', to: '/initiatives', color: 'text-amber-600 bg-amber-50' },
  { icon: Hammer, title: 'פרויקטים משותפים', desc: 'פינת ישיבה, מתחם נינג\'ה, חדר אחסון', to: '/projects', color: 'text-orange-600 bg-orange-50' },
  { icon: MapPin, title: 'סיורים יזומים', desc: 'מוזיאונים, טבע, מורשת, עסקים מקומיים', to: '/tours', color: 'text-green-600 bg-green-50' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ children: 0, initiatives: 0, challenges: 0, tours: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [children, initiatives, challenges, tours] = await Promise.all([
          base44.entities.Child.list(),
          base44.entities.Initiative.list(),
          base44.entities.Challenge.list(),
          base44.entities.Tour.list(),
        ]);
        setStats({
          children: children.length,
          initiatives: initiatives.length,
          challenges: challenges.length,
          tours: tours.length,
        });
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="space-y-10">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-foreground text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          תשפ"ז 26-27
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">חזון תכנית ההעצמה</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">תהליך משמעותי לגילוי עצמי, הכרה בערך העצמי וצמיחה מתוך העולם הפנימי</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">שלוש מטרות התהליך</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {GOALS.map((goal, i) => (
            <Card key={i} className="text-center">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <goal.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{goal.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{goal.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ילדים', value: stats.children, icon: Users, to: '/children' },
          { label: 'יוזמות', value: stats.initiatives, icon: Lightbulb, to: '/initiatives' },
          { label: 'אתגרים', value: stats.challenges, icon: Target, to: '/challenges' },
          { label: 'סיורים', value: stats.tours, icon: MapPin, to: '/tours' },
        ].map((s, i) => (
          <Link key={i} to={s.to}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">שש דרכי הפעולה</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {METHODS.map((method, i) => (
            <Link key={i} to={method.to}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${method.color}`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{method.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}