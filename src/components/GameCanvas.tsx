import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Lock, Star } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Zone } from '../types/game';

interface GameCanvasProps {
  onZoneSelect?: (zone: Zone) => void;
}

export function GameCanvas({ onZoneSelect }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const { state, selectZone } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mystical background
    const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400);
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(0.5, '#312e81');
    gradient.addColorStop(1, '#1f2937');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connecting paths between unlocked zones
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const unlockedZones = state.zones.filter(zone => zone.isUnlocked);
    for (let i = 0; i < unlockedZones.length - 1; i++) {
      const zone1 = unlockedZones[i];
      const zone2 = unlockedZones[i + 1];

      ctx.beginPath();
      ctx.moveTo(zone1.coordinates.x, zone1.coordinates.y);
      ctx.lineTo(zone2.coordinates.x, zone2.coordinates.y);
      ctx.stroke();
    }

    // Draw zones
    state.zones.forEach(zone => {
      const { x, y } = zone.coordinates;
      const isSelected = selectedZone === zone.id;
      const isCurrentZone = state.player?.currentZone === zone.id;

      // Zone circle
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 35 : 30, 0, 2 * Math.PI);

      if (zone.isUnlocked) {
        ctx.fillStyle = isCurrentZone ? '#f59e0b' : zone.color;
        ctx.shadowColor = zone.color;
        ctx.shadowBlur = isSelected ? 20 : 10;
      } else {
        ctx.fillStyle = '#374151';
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;

      // Zone border
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.setLineDash([]);
      ctx.stroke();

      // Zone icon/indicator
      ctx.fillStyle = zone.isUnlocked ? '#ffffff' : '#6b7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.isUnlocked ? '⭐' : '🔒', x, y + 5);
    });

    // Draw player position if available
    if (state.player) {
      const currentZone = state.zones.find(z => z.id === state.player?.currentZone);
      if (currentZone) {
        const { x, y } = currentZone.coordinates;

        // Player indicator
        ctx.beginPath();
        ctx.arc(x, y - 45, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Player label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', x, y - 55);
      }
    }
  }, [state.zones, state.player, selectedZone]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is within any zone
    const clickedZone = state.zones.find(zone => {
      const distance = Math.sqrt(
        Math.pow(x - zone.coordinates.x, 2) + Math.pow(y - zone.coordinates.y, 2)
      );
      return distance <= 35;
    });

    if (clickedZone) {
      setSelectedZone(clickedZone.id);
      if (clickedZone.isUnlocked) {
        selectZone(clickedZone.id);
      }
      if (clickedZone && onZoneSelect) {
        onZoneSelect(clickedZone);
      }
    } else {
      setSelectedZone(null);
    }
  };

  const selectedZoneData = selectedZone ? state.zones.find(z => z.id === selectedZone) : null;

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="border border-white/20 rounded-lg cursor-pointer bg-gradient-to-br from-slate-900 to-slate-800"
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      {selectedZoneData && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-xs border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            {selectedZoneData.isUnlocked ? (
              <Star className="w-5 h-5 text-yellow-400" />
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
            <h3 className="font-bold text-white">{selectedZoneData.name}</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">{selectedZoneData.description}</p>

          {selectedZoneData.isUnlocked ? (
            <div className="space-y-2">
              <p className="text-xs text-emerald-400">✓ Unlocked</p>
              {selectedZoneData.quests.length > 0 && (
                <p className="text-xs text-blue-400">
                  {selectedZoneData.quests.length} quest(s) available
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-red-400">🔒 Locked</p>
              {selectedZoneData.requiredLevel && (
                <p className="text-xs text-gray-400">
                  Requires level {selectedZoneData.requiredLevel}
                </p>
              )}
              {selectedZoneData.requiredTraits && (
                <p className="text-xs text-gray-400">
                  Requires traits: {selectedZoneData.requiredTraits.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}