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
      title: "Primary Brand Colors",
      colors: [
        { name: 'IMG Blue', hex: '#184a69' },
        { name: 'IMG Blue Light', hex: '#f0f4f7' },
        { name: 'IMG Blue Dark', hex: '#11334b' },
      ]
    },
    {
      title: "Secondary Colors", 
      colors: [
        { name: 'Accent Blue', hex: '#3c80a9' },
        { name: 'Accent Blue Light', hex: '#f1f6fa' },
        { name: 'Accent Blue Dark', hex: '#244d65' },
        
        { name: 'Academy Blue', hex: '#006fba' },
        { name: 'Academy Blue Light', hex: '#e6f2ff' },
        { name: 'Academy Blue Dark', hex: '#003d6f' },
      ]
    },
    {
      title: "Neutral Colors",
      colors: [
        { name: 'White', hex: '#ffffff' },
        { name: 'Input Gray', hex: '#e0e0e0' },
        { name: 'Text Gray', hex: '#424242' },
        { name: 'Black', hex: '#000000' },
        { name: 'Corporate Navy', hex: '#002d54' },
      ]
    },
    {
      title: "Action Colors",
      colors: [
        { name: 'CTA Red', hex: '#de3942' },
        { name: 'CTA Red Hover', hex: '#c32129' },
        { name: 'CTA Red Disabled', hex: '#fbe9ea' },
        
        { name: 'Link Blue', hex: '#366e92' },
        { name: 'Link Blue Light', hex: '#f0f5f9' },
        { name: 'Link Blue Dark', hex: '#2a5571' },
      ]
    },
    {
      title: "State Colors",
      colors: [
        { name: 'Success Green', hex: '#bfd730' },
        { name: 'Success Light', hex: '#f8fce6' },
        { name: 'Success Dark', hex: '#73811d' },
        
        { name: 'Warning', hex: '#f59e0b' },
        { name: 'Warning Light', hex: '#fffbeb' },
        { name: 'Warning Dark', hex: '#b45309' },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {colorSystems.map((system) => (
        <div key={system.title} className="space-y-4">
          <Typography variant="h3" weight="semibold">{system.title}</Typography>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
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