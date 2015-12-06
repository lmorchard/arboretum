import { expect } from "chai";
import { createStore, applyMiddleware } from 'redux';
import { foo } from '../src/lib/utils';

describe('utils', () => {

  describe('play', () => {
    it('foo should return true', () => {
      expect(foo()).to.equal(true);
    })
  });

});
