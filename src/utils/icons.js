import { BookOpen, Feather, Flame, Music, Star } from 'lucide-react'

const ICON_MAP = { BookOpen, Feather, Flame, Music, Star }

export function getIcon(name) {
  return ICON_MAP[name] || BookOpen
}
