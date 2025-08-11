import { Quest, Zone, PlayerTrait } from '../types/game';

export const gameData = {
  zones: [
    {
      id: 'forest_echoes',
      name: 'Forest of Echoes',
      description: 'Ancient woods where whispers of the past linger among twisted trees.',
      isUnlocked: true,
      quests: ['forest_discovery', 'ancient_runes'],
      lore: 'Long ago, the Forest of Echoes was a sacred grove where druids communed with nature spirits. Now, only their whispers remain.',
      coordinates: { x: 200, y: 300 },
      color: '#10b981'
    },
    {
      id: 'crystal_caverns',
      name: 'Crystal Caverns',
      description: 'Luminescent caves filled with magical crystals and hidden secrets.',
      isUnlocked: false,
      requiredTraits: ['explorer'],
      quests: ['crystal_resonance', 'deep_mysteries'],
      lore: 'The Crystal Caverns pulse with ancient magic, their walls lined with gems that sing with otherworldly melodies.',
      coordinates: { x: 400, y: 200 },
      color: '#8b5cf6'
    },
    {
      id: 'shadow_peaks',
      name: 'Shadow Peaks',
      description: 'Treacherous mountains shrouded in perpetual twilight.',
      isUnlocked: false,
      requiredLevel: 3,
      requiredTraits: ['fighter', 'scholar'],
      quests: ['peak_ascension', 'shadow_lord'],
      lore: 'The Shadow Peaks are home to ancient evils and forgotten knowledge, where only the bravest dare to tread.',
      coordinates: { x: 600, y: 100 },
      color: '#374151'
    },
    {
      id: 'ethereal_gardens',
      name: 'Ethereal Gardens',
      description: 'A mystical realm where reality bends and dreams take form.',
      isUnlocked: false,
      requiredTraits: ['trickster', 'scholar'],
      quests: ['dream_walker', 'reality_weaver'],
      lore: 'In the Ethereal Gardens, the boundary between dream and reality dissolves, revealing truths beyond mortal comprehension.',
      coordinates: { x: 300, y: 450 },
      color: '#f59e0b'
    }
  ] as Zone[],

  quests: [
    {
      id: 'forest_discovery',
      title: 'Whispers in the Woods',
      description: 'Investigate the strange sounds echoing through the Forest of Echoes.',
      zone: 'forest_echoes',
      objectives: [
        {
          id: 'find_source',
          description: 'Locate the source of the whispers',
          isCompleted: false,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'commune_spirit',
          description: 'Commune with the forest spirit',
          isCompleted: false,
          progress: 0,
          maxProgress: 1
        }
      ],
      rewards: [
        { type: 'xp', value: 50, description: '+50 XP' },
        { type: 'trait', value: 'explorer', description: 'Explorer trait' }
      ],
      isCompleted: false,
      isActive: false,
      storyChoices: [
        {
          id: 'peaceful_approach',
          text: 'Approach the spirit with peaceful intentions',
          consequences: {
            traits: ['peaceful_soul'],
            xp: 25
          }
        },
        {
          id: 'aggressive_approach',
          text: 'Demand answers from the spirit',
          consequences: {
            traits: ['aggressive'],
            xp: 10
          }
        }
      ]
    },
    {
      id: 'ancient_runes',
      title: 'The Scholar\'s Path',
      description: 'Decipher the ancient runes carved into the old oak trees.',
      zone: 'forest_echoes',
      objectives: [
        {
          id: 'collect_runes',
          description: 'Collect runic inscriptions',
          isCompleted: false,
          progress: 0,
          maxProgress: 5
        },
        {
          id: 'translate_meaning',
          description: 'Translate the ancient text',
          isCompleted: false,
          progress: 0,
          maxProgress: 1
        }
      ],
      rewards: [
        { type: 'xp', value: 75, description: '+75 XP' },
        { type: 'trait', value: 'scholar', description: 'Scholar trait' },
        { type: 'zone_unlock', value: 'crystal_caverns', description: 'Unlock Crystal Caverns' }
      ],
      isCompleted: false,
      isActive: false,
      storyChoices: [
        {
          id: 'share_knowledge',
          text: 'Share your translation with other scholars',
          consequences: {
            traits: ['generous'],
            xp: 30
          }
        },
        {
          id: 'hoard_knowledge',
          text: 'Keep the knowledge secret for personal gain',
          consequences: {
            traits: ['secretive'],
            xp: 15
          }
        }
      ]
    },
    {
      id: 'crystal_resonance',
      title: 'Songs of the Crystal',
      description: 'Learn to harmonize with the singing crystals deep within the caverns.',
      zone: 'crystal_caverns',
      requiredTraits: ['explorer'],
      objectives: [
        {
          id: 'find_resonance',
          description: 'Find the resonance frequency',
          isCompleted: false,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'crystal_harmony',
          description: 'Achieve harmony with the crystals',
          isCompleted: false,
          progress: 0,
          maxProgress: 1
        }
      ],
      rewards: [
        { type: 'xp', value: 100, description: '+100 XP' },
        { type: 'trait', value: 'crystal_singer', description: 'Crystal Singer trait' }
      ],
      isCompleted: false,
      isActive: false,
      storyChoices: [
        {
          id: 'gentle_harmony',
          text: 'Sing gently with the crystals',
          consequences: {
            traits: ['harmonious'],
            xp: 40
          }
        },
        {
          id: 'forceful_resonance',
          text: 'Force the crystals to resonate louder',
          consequences: {
            traits: ['dominating'],
            xp: 20
          }
        }
      ]
    },
    {
      id: 'peak_ascension',
      title: 'Climb to Darkness',
      description: 'Ascend the treacherous Shadow Peaks to uncover ancient secrets.',
      zone: 'shadow_peaks',
      requiredLevel: 3,
      requiredTraits: ['fighter'],
      objectives: [
        {
          id: 'climb_peak',
          description: 'Reach the summit',
          isCompleted: false,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'face_guardian',
          description: 'Confront the peak guardian',
          isCompleted: false,
          progress: 0,
          maxProgress: 1
        }
      ],
      rewards: [
        { type: 'xp', value: 150, description: '+150 XP' },
        { type: 'trait', value: 'peak_conqueror', description: 'Peak Conqueror trait' },
        { type: 'nft', value: 'shadow_peak_lore', description: 'Shadow Peak Lore NFT' }
      ],
      isCompleted: false,
      isActive: false,
      storyChoices: [
        {
          id: 'honorable_combat',
          text: 'Face the guardian in honorable combat',
          consequences: {
            traits: ['honorable'],
            xp: 50
          }
        },
        {
          id: 'cunning_strategy',
          text: 'Use cunning to outwit the guardian',
          consequences: {
            traits: ['cunning'],
            xp: 35
          }
        }
      ]
    }
  ] as Quest[],

  traits: [
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'One who seeks new paths and hidden places.',
      icon: '🗺️',
      rarity: 'common' as const
    },
    {
      id: 'scholar',
      name: 'Scholar',
      description: 'A seeker of knowledge and ancient wisdom.',
      icon: '📚',
      rarity: 'common' as const
    },
    {
      id: 'fighter',
      name: 'Fighter',
      description: 'A warrior who faces danger head-on.',
      icon: '⚔️',
      rarity: 'common' as const
    },
    {
      id: 'trickster',
      name: 'Trickster',
      description: 'One who uses wit and cunning to overcome obstacles.',
      icon: '🎭',
      rarity: 'rare' as const
    },
    {
      id: 'peaceful_soul',
      name: 'Peaceful Soul',
      description: 'One who seeks harmony over conflict.',
      icon: '☮️',
      rarity: 'rare' as const
    },
    {
      id: 'crystal_singer',
      name: 'Crystal Singer',
      description: 'Attuned to the magical resonance of crystals.',
      icon: '💎',
      rarity: 'epic' as const
    },
    {
      id: 'peak_conqueror',
      name: 'Peak Conqueror',
      description: 'One who has conquered the highest peaks.',
      icon: '🏔️',
      rarity: 'legendary' as const
    }
  ] as PlayerTrait[]
};