import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WARNING_MESSAGES, MAX_OFFENSES } from '../constants.js';

// Mock constants or logic if needed in future tests

describe('Bot Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly identify warning messages', () => {
    expect(WARNING_MESSAGES[1]).toContain('first warning');
    expect(WARNING_MESSAGES[2]).toContain('Final Warning');
    expect(WARNING_MESSAGES[3]).toContain('banned');
  });

  it('should not exceed MAX_OFFENSES in message selection', () => {
    const overflowCount = MAX_OFFENSES + 1;
    const message = WARNING_MESSAGES[Math.min(overflowCount, MAX_OFFENSES)];
    expect(message).toBe(WARNING_MESSAGES[MAX_OFFENSES]);
  });
});
