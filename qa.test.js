import {expect, jest, test} from '@jest/globals';

function double(x) {
  return x * 2;
}

test('adds 1+2 expecting 3', () => {
  expect(double(20)).toBe(40);
})