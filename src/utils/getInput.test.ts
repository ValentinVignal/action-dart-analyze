import { getInputSafe } from './getInput';

describe('getInput', () => {
  let processEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    processEnv = process.env;
  });

  afterEach(() => {
    process.env = processEnv;
  });

  describe('with "-" in the name', () => {
    it('should return empty string if there is no value', () => {
      const value = getInputSafe('fail-on');
      expect(value).toBe('');
    });

    it('should return the value set by the bash script', () => {
      process.env.INPUT_FAIL_ON = 'warning';
      const value = getInputSafe('fail-on');
      expect(value).toBe('warning');
    });

    it('should return the value set by github action', () => {
      process.env['INPUT_FAIL-ON'] = 'warning';
      const value = getInputSafe('fail-on');
      expect(value).toBe('warning');
    });
  });

  describe('without "-" in the name', () => {
    it('should return empty string if there is no value', () => {
      const value = getInputSafe('emojis');
      expect(value).toBe('');
    });

    it('should throw an error if there is no value and it is required', () => {
      const f = () => getInputSafe('token', { required: true });
      expect(f).toThrowError();
    });

    it('should throw an error if there is no value and it is required', () => {
      process.env.INPUT_TOKEN = 'token';
      const value = getInputSafe('token', { required: true });
      expect(value).toBe('token');
    });
  });
});
