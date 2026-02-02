import { describe, it, expect } from 'vitest';
import { getPreset, getAllPresets, PRESETS } from '../scalePresets';

describe('scalePresets', () => {
  describe('getAllPresets', () => {
    it('should return all 5 preset names', () => {
      const presets = getAllPresets();
      expect(presets).toHaveLength(5);
      expect(presets).toContain('5点Likert量表');
      expect(presets).toContain('7点Likert量表');
      expect(presets).toContain('1-10评分');
      expect(presets).toContain('满意度5级');
      expect(presets).toContain('频率5级');
    });
  });

  describe('getPreset', () => {
    it('should return 5-point Likert preset', () => {
      const preset = getPreset('5点Likert量表');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(5);
      expect(preset?.points[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(preset?.points[4]).toEqual({ value: 5, label: '非常同意' });
    });

    it('should return 7-point Likert preset', () => {
      const preset = getPreset('7点Likert量表');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(7);
      expect(preset?.points[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(preset?.points[6]).toEqual({ value: 7, label: '非常同意' });
    });

    it('should return 1-10 rating preset', () => {
      const preset = getPreset('1-10评分');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(10);
      expect(preset?.points[0]).toEqual({ value: 1, label: '1' });
      expect(preset?.points[9]).toEqual({ value: 10, label: '10' });
    });

    it('should return satisfaction 5-level preset', () => {
      const preset = getPreset('满意度5级');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(5);
      expect(preset?.points[0]).toEqual({ value: 1, label: '非常不满意' });
      expect(preset?.points[4]).toEqual({ value: 5, label: '非常满意' });
    });

    it('should return frequency 5-level preset', () => {
      const preset = getPreset('频率5级');
      expect(preset).toBeDefined();
      expect(preset?.points).toHaveLength(5);
      expect(preset?.points[0]).toEqual({ value: 1, label: '从不' });
      expect(preset?.points[4]).toEqual({ value: 5, label: '总是' });
    });

    it('should return undefined for unknown preset', () => {
      const preset = getPreset('Unknown preset');
      expect(preset).toBeUndefined();
    });
  });
});
