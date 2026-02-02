import { describe, it, expect } from 'vitest';
import { generateScale } from '../scaleInterpolator';
import { ScalePoint } from '../types/question';

describe('scaleInterpolator', () => {
  describe('generateScale with known patterns', () => {
    it('should generate 5-point Likert scale', () => {
      const result = generateScale(1, 5, '非常不同意', '非常同意');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(result[2]).toEqual({ value: 3, label: '中立' });
      expect(result[4]).toEqual({ value: 5, label: '非常同意' });
    });

    it('should generate 7-point Likert scale', () => {
      const result = generateScale(1, 7, '非常不同意', '非常同意');
      expect(result).toHaveLength(7);
      expect(result[0]).toEqual({ value: 1, label: '非常不同意' });
      expect(result[3]).toEqual({ value: 4, label: '中立' });
      expect(result[6]).toEqual({ value: 7, label: '非常同意' });
    });

    it('should generate satisfaction scale', () => {
      const result = generateScale(1, 5, '非常不满意', '非常满意');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: '非常不满意' });
      expect(result[2]).toEqual({ value: 3, label: '一般' });
      expect(result[4]).toEqual({ value: 5, label: '非常满意' });
    });

    it('should generate frequency scale', () => {
      const result = generateScale(1, 5, '从不', '总是');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: '从不' });
      expect(result[2]).toEqual({ value: 3, label: '有时' });
      expect(result[4]).toEqual({ value: 5, label: '总是' });
    });
  });

  describe('generateScale with numeric fallback', () => {
    it('should use numeric labels for unknown patterns', () => {
      const result = generateScale(1, 5, 'Custom Start', 'Custom End');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: 'Custom Start' });
      expect(result[1]).toEqual({ value: 2, label: '2' });
      expect(result[4]).toEqual({ value: 5, label: 'Custom End' });
    });

    it('should generate 1-10 numeric scale', () => {
      const result = generateScale(1, 10, '1', '10');
      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ value: 1, label: '1' });
      expect(result[9]).toEqual({ value: 10, label: '10' });
    });
  });

  describe('generateScale edge cases', () => {
    it('should handle 2-point scale', () => {
      const result = generateScale(1, 2, 'Low', 'High');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: 1, label: 'Low' });
      expect(result[1]).toEqual({ value: 2, label: 'High' });
    });

    it('should handle non-numeric values', () => {
      const result = generateScale(0, 4, 'A', 'E');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 0, label: 'A' });
      expect(result[4]).toEqual({ value: 4, label: 'E' });
    });
  });
});
