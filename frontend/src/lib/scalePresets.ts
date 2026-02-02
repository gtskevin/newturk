import { ScaleConfig } from '../types/question';

export interface PresetDefinition {
  name: string;
  scale: ScaleConfig;
}

export const PRESETS: PresetDefinition[] = [
  {
    name: '5点Likert量表',
    scale: {
      type: 'preset',
      presetName: '5点Likert量表',
      points: [
        { value: 1, label: '非常不同意' },
        { value: 2, label: '不同意' },
        { value: 3, label: '中立' },
        { value: 4, label: '同意' },
        { value: 5, label: '非常同意' },
      ],
      showValue: true,
      showLabel: true,
    },
  },
  {
    name: '7点Likert量表',
    scale: {
      type: 'preset',
      presetName: '7点Likert量表',
      points: [
        { value: 1, label: '非常不同意' },
        { value: 2, label: '不同意' },
        { value: 3, label: '有点不同意' },
        { value: 4, label: '中立' },
        { value: 5, label: '有点同意' },
        { value: 6, label: '同意' },
        { value: 7, label: '非常同意' },
      ],
      showValue: true,
      showLabel: true,
    },
  },
  {
    name: '1-10评分',
    scale: {
      type: 'preset',
      presetName: '1-10评分',
      points: Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: String(i + 1),
      })),
      showValue: true,
      showLabel: true,
    },
  },
  {
    name: '满意度5级',
    scale: {
      type: 'preset',
      presetName: '满意度5级',
      points: [
        { value: 1, label: '非常不满意' },
        { value: 2, label: '不满意' },
        { value: 3, label: '一般' },
        { value: 4, label: '满意' },
        { value: 5, label: '非常满意' },
      ],
      showValue: false,
      showLabel: true,
    },
  },
  {
    name: '频率5级',
    scale: {
      type: 'preset',
      presetName: '频率5级',
      points: [
        { value: 1, label: '从不' },
        { value: 2, label: '很少' },
        { value: 3, label: '有时' },
        { value: 4, label: '经常' },
        { value: 5, label: '总是' },
      ],
      showValue: false,
      showLabel: true,
    },
  },
];

export function getAllPresets(): string[] {
  return PRESETS.map(p => p.name);
}

export function getPreset(name: string): ScaleConfig | undefined {
  const preset = PRESETS.find(p => p.name === name);
  return preset ? { ...preset.scale } : undefined;
}
