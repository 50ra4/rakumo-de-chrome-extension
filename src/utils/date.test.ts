import { timeStringToMinute } from './date';

describe('utils/date', () => {
  describe('timeStringToMinute', () => {
    it('should the value converted to minute', () => {
      expect(timeStringToMinute('3:35')).toBe(215);
    });
  });
});
