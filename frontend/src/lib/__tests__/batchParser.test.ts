import { parseBatchInput, detectDelimiter } from '../batchParser';

describe('parseBatchInput', () => {
  it('should parse newline-separated items', () => {
    const text = '选项一\n选项二\n选项三';
    const result = parseBatchInput(text);
    expect(result).toEqual(['选项一', '选项二', '选项三']);
  });

  it('should trim whitespace', () => {
    const text = '  选项一  \n  选项二  ';
    const result = parseBatchInput(text);
    expect(result).toEqual(['选项一', '选项二']);
  });

  it('should skip empty lines', () => {
    const text = '选项一\n\n选项二\n\n\n选项三';
    const result = parseBatchInput(text);
    expect(result).toEqual(['选项一', '选项二', '选项三']);
  });

  it('should parse semicolon-separated items', () => {
    const text = '选项一;选项二;选项三';
    const result = parseBatchInput(text);
    expect(result).toEqual(['选项一', '选项二', '选项三']);
  });

  it('should parse comma-separated items', () => {
    const text = '选项一,选项二,选项三';
    const result = parseBatchInput(text);
    expect(result).toEqual(['选项一', '选项二', '选项三']);
  });

  it('should handle Excel copy-paste with tabs', () => {
    const text = '选项一\t选项二\t选项三';
    const result = parseBatchInput(text);
    expect(result).toEqual(['选项一', '选项二', '选项三']);
  });

  it('should handle mixed newlines and delimiters', () => {
    const text = '选项一,选项二\n选项三;选项四';
    const result = parseBatchInput(text);
    expect(result).toEqual(['选项一', '选项二', '选项三', '选项四']);
  });
});

describe('detectDelimiter', () => {
  it('should detect newline as default', () => {
    const result = detectDelimiter('选项一\n选项二\n选项三');
    expect(result).toBe('newline');
  });

  it('should detect semicolon', () => {
    const result = detectDelimiter('选项一;选项二;选项三');
    expect(result).toBe('semicolon');
  });

  it('should detect comma', () => {
    const result = detectDelimiter('选项一,选项二,选项三');
    expect(result).toBe('comma');
  });

  it('should detect tab', () => {
    const result = detectDelimiter('选项一\t选项二\t选项三');
    expect(result).toBe('tab');
  });
});
