export const CATEGORIES = {
  streaming: { name: 'Streaming', icon: 'play-circle', color: '#377AF2' },
  music: { name: 'Musique', icon: 'music', color: '#F24B37' },
  gaming: { name: 'Gaming', icon: 'gamepad-variant', color: '#37F2A8' },
  fitness: { name: 'Fitness', icon: 'dumbbell', color: '#F2B237' },
  insurance: { name: 'Assurance', icon: 'shield-check', color: '#9437F2' },
  education: { name: 'Éducation', icon: 'school', color: '#F237E7' },
  software: { name: 'Logiciels', icon: 'application', color: '#37E4F2' },
  utilities: { name: 'Services', icon: 'cog', color: '#8CF237' },
  water: { name: 'Eau', icon: 'water', color: '#37C7F2' },
  energy: { name: 'Energie', icon: 'flash', color: '#F2B737' },
  health: { name: 'Santé', icon: 'medical-bag', color: '#F23737' },
  donations: { name: 'Associations/Don', icon: 'hand-heart', color: '#F237B7' },
  pets: { name: 'Animaux', icon: 'paw', color: '#8B4513' },
  other: { name: 'Autres', icon: 'dots-horizontal', color: '#666666' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES; 