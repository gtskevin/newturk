import React from 'react';
import { getPreset, getAllPresets } from '../../../lib/scalePresets';
import { ScaleConfig } from '../../../types/question';

interface PresetSelectorProps {
  onSelect: (name: string, scale: ScaleConfig) => void;
  value?: string;
}

export default function PresetSelector({ onSelect, value }: PresetSelectorProps) {
  const presets = getAllPresets();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    if (!presetName) return;

    const scale = getPreset(presetName);
    if (scale) {
      onSelect(presetName, scale);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        预设模板
      </label>
      <select
        value={value || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">选择预设模板...</option>
        {presets.map(preset => (
          <option key={preset} value={preset}>
            {preset}
          </option>
        ))}
      </select>
    </div>
  );
}
