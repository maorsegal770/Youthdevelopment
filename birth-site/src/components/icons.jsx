import React from "react";
import { Heart, Baby, Users, Sparkles, Wind, Moon, Flower2, ShieldCheck, MessageCircleHeart, BookOpen } from "lucide-react";

const MAP = {
  heart: Heart,
  baby: Baby,
  users: Users,
  sparkles: Sparkles,
  wind: Wind,
  moon: Moon,
  flower: Flower2,
  shield: ShieldCheck,
  message: MessageCircleHeart,
  book: BookOpen,
};

export function SectionIcon({ name, className }) {
  const Icon = MAP[name] || Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
