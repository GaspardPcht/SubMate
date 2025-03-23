export const CATEGORIES = {
  streaming: { name: 'Streaming', icon: 'play-circle', color: '#377AF2' },
  music: { name: 'Musique', icon: 'music', color: '#F24B37' },
  gaming: { name: 'Gaming', icon: 'gamepad-variant', color: '#37F2A8' },
  fitness: { name: 'Sport', icon: 'dumbbell', color: '#F2B237' },
  insurance: { name: 'Assurance', icon: 'shield-check', color: '#9437F2' },
  cloud: { name: 'Cloud', icon: 'cloud', color: '#37D6F2' },
  education: { name: 'Formation', icon: 'school', color: '#F237D6' },
  other: { name: 'Autres', icon: 'dots-horizontal', color: '#666666' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES; 