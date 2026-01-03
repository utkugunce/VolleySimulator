import { 
  validateScore,
  validateMatchId,
  isValidScore,
  ScoreSchema,
  PredictionSchema,
  LeagueIdSchema
} from '../app/utils/apiValidation';

describe('API Validation Utilities', () => {
  describe('ScoreSchema', () => {
    it('should validate correct score format', () => {
      expect(ScoreSchema.safeParse('3-0').success).toBe(true);
      expect(ScoreSchema.safeParse('3-1').success).toBe(true);
      expect(ScoreSchema.safeParse('3-2').success).toBe(true);
      expect(ScoreSchema.safeParse('2-3').success).toBe(true);
      expect(ScoreSchema.safeParse('1-3').success).toBe(true);
      expect(ScoreSchema.safeParse('0-3').success).toBe(true);
    });

    it('should reject invalid score formats', () => {
      expect(ScoreSchema.safeParse('4-0').success).toBe(false);
      expect(ScoreSchema.safeParse('abc').success).toBe(false);
      expect(ScoreSchema.safeParse('').success).toBe(false);
      expect(ScoreSchema.safeParse(null).success).toBe(false);
    });
  });

  describe('LeagueIdSchema', () => {
    it('should validate correct league IDs', () => {
      expect(LeagueIdSchema.safeParse('vsl').success).toBe(true);
      expect(LeagueIdSchema.safeParse('1lig').success).toBe(true);
      expect(LeagueIdSchema.safeParse('2lig').success).toBe(true);
      expect(LeagueIdSchema.safeParse('cev-cl').success).toBe(true);
      expect(LeagueIdSchema.safeParse('cev-cup').success).toBe(true);
      expect(LeagueIdSchema.safeParse('cev-challenge').success).toBe(true);
    });

    it('should reject invalid league IDs', () => {
      expect(LeagueIdSchema.safeParse('invalid').success).toBe(false);
      expect(LeagueIdSchema.safeParse('3lig').success).toBe(false);
      expect(LeagueIdSchema.safeParse('').success).toBe(false);
    });
  });

  describe('PredictionSchema', () => {
    it('should validate a complete prediction object', () => {
      const validPrediction = {
        matchId: 'vsl-2024-001',
        score: '3-1',
        leagueId: 'vsl'
      };

      const result = PredictionSchema.safeParse(validPrediction);
      expect(result.success).toBe(true);
    });

    it('should reject invalid prediction objects', () => {
      const invalidPrediction = {
        matchId: '',
        score: 'invalid',
        leagueId: 'invalid'
      };

      const result = PredictionSchema.safeParse(invalidPrediction);
      expect(result.success).toBe(false);
    });

    it('should require all fields', () => {
      const partialPrediction = {
        matchId: 'test-123'
      };

      const result = PredictionSchema.safeParse(partialPrediction);
      expect(result.success).toBe(false);
    });
  });

  describe('isValidScore', () => {
    it('should return true for valid volleyball scores', () => {
      expect(isValidScore('3-0')).toBe(true);
      expect(isValidScore('3-1')).toBe(true);
      expect(isValidScore('3-2')).toBe(true);
      expect(isValidScore('0-3')).toBe(true);
      expect(isValidScore('1-3')).toBe(true);
      expect(isValidScore('2-3')).toBe(true);
    });

    it('should return false for invalid scores', () => {
      expect(isValidScore('2-2')).toBe(false);
      expect(isValidScore('4-1')).toBe(false);
      expect(isValidScore('')).toBe(false);
      expect(isValidScore('invalid')).toBe(false);
    });
  });

  describe('validateScore', () => {
    it('should return valid for correct scores', () => {
      expect(validateScore('3-0').valid).toBe(true);
      expect(validateScore('3-2').valid).toBe(true);
    });

    it('should return invalid with error for bad scores', () => {
      const result = validateScore('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateMatchId', () => {
    it('should return valid for non-empty strings', () => {
      expect(validateMatchId('match-123').valid).toBe(true);
    });

    it('should return invalid for empty or non-string values', () => {
      expect(validateMatchId('').valid).toBe(false);
      expect(validateMatchId(null).valid).toBe(false);
      expect(validateMatchId(undefined).valid).toBe(false);
    });
  });
});
