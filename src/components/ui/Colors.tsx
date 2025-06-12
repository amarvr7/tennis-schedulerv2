import React from 'react';
import Typography from './Typography';

interface ColorSwatchProps {
  name: string;
  hex: string;
}

function ColorSwatch({ name, hex }: ColorSwatchProps) {
  return (
    <div className="flex flex-col">
      <div 
        className="h-16 w-full rounded-md mb-2"
        style={{ backgroundColor: hex }}
      />
      <Typography variant="small" weight="medium">{name}</Typography>
      <Typography variant="subtle">{hex}</Typography>
    </div>
  );
}

export default function Colors() {
  const colorSystems = [
    {
      title: "Primary Colors",
      colors: [
        { name: 'Primary 50', hex: '#EFF6FF' },
        { name: 'Primary 100', hex: '#DBEAFE' },
        { name: 'Primary 200', hex: '#BFDBFE' },
        { name: 'Primary 300', hex: '#93C5FD' },
        { name: 'Primary 400', hex: '#60A5FA' },
        { name: 'Primary 500', hex: '#3B82F6' },
        { name: 'Primary 600', hex: '#2563EB' },
        { name: 'Primary 700', hex: '#1D4ED8' },
        { name: 'Primary 800', hex: '#1E40AF' },
        { name: 'Primary 900', hex: '#1E3A8A' },
        { name: 'Primary 950', hex: '#172554' },
      ]
    },
    {
      title: "Secondary Colors",
      colors: [
        { name: 'Secondary 50', hex: '#FFFBEB' },
        { name: 'Secondary 100', hex: '#FEF3C7' },
        { name: 'Secondary 200', hex: '#FDE68A' },
        { name: 'Secondary 300', hex: '#FCD34D' },
        { name: 'Secondary 400', hex: '#FBBF24' },
        { name: 'Secondary 500', hex: '#F59E0B' },
        { name: 'Secondary 600', hex: '#D97706' },
        { name: 'Secondary 700', hex: '#B45309' },
        { name: 'Secondary 800', hex: '#92400E' },
        { name: 'Secondary 900', hex: '#78350F' },
        { name: 'Secondary 950', hex: '#451A03' },
      ]
    },
    {
      title: "Neutral Colors",
      colors: [
        { name: 'Neutral 50', hex: '#F9FAFB' },
        { name: 'Neutral 100', hex: '#F3F4F6' },
        { name: 'Neutral 200', hex: '#E5E7EB' },
        { name: 'Neutral 300', hex: '#D1D5DB' },
        { name: 'Neutral 400', hex: '#9CA3AF' },
        { name: 'Neutral 500', hex: '#6B7280' },
        { name: 'Neutral 600', hex: '#4B5563' },
        { name: 'Neutral 700', hex: '#374151' },
        { name: 'Neutral 800', hex: '#1F2937' },
        { name: 'Neutral 900', hex: '#111827' },
        { name: 'Neutral 950', hex: '#030712' },
      ]
    },
  ];

  const stateColors = [
    {
      title: "State Colors",
      colors: [
        { name: 'Success', hex: '#10B981' },
        { name: 'Success Light', hex: '#ECFDF5' },
        { name: 'Success Dark', hex: '#047857' },
        
        { name: 'Error', hex: '#EF4444' },
        { name: 'Error Light', hex: '#FEF2F2' },
        { name: 'Error Dark', hex: '#B91C1C' },
        
        { name: 'Warning', hex: '#F59E0B' },
        { name: 'Warning Light', hex: '#FFFBEB' },
        { name: 'Warning Dark', hex: '#B45309' },
        
        { name: 'Info', hex: '#3B82F6' },
        { name: 'Info Light', hex: '#EFF6FF' },
        { name: 'Info Dark', hex: '#1D4ED8' },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {stateColors.map((group) => (
        <div key={group.title} className="space-y-4">
          <Typography variant="h3" weight="semibold">{group.title}</Typography>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {group.colors.map((color) => (
              <ColorSwatch
                key={color.name}
                name={color.name}
                hex={color.hex}
              />
            ))}
          </div>
        </div>
      ))}

      {colorSystems.map((system) => (
        <div key={system.title} className="space-y-4">
          <Typography variant="h3" weight="semibold">{system.title}</Typography>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {system.colors.map((color) => (
              <ColorSwatch
                key={color.name}
                name={color.name}
                hex={color.hex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 