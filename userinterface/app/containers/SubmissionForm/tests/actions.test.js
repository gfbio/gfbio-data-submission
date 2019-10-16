import { changeLicense } from '../actions';
import { CHANGE_LICENSE } from '../constants';

describe('SubmissionForm actions', () => {
  describe('Default Action', () => {
    it('has a type of DEFAULT_ACTION', () => {
      const expected = {
        type: CHANGE_LICENSE,
      };
      expect(changeLicense()).toEqual(expected);
    });
  });
});
