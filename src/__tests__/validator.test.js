import validator from '../validator';

test('empty', () => {
  expect(validator('')).toBe(false);
});

test('first empty', () => {
  expect(validator(', 456')).toBe(false);
});

test('last empty', () => {
  expect(validator('123, ')).toBe(false);
});

test('width space', () => {
  expect(validator('123, 456')).toStrictEqual({ coords: { latitude: '123', longitude: '456' } });
});

test('without space', () => {
  expect(validator('123,456')).toStrictEqual({ coords: { latitude: '123', longitude: '456' } });
});

test('with []', () => {
  expect(validator('[123, 456]')).toStrictEqual({ coords: { latitude: '123', longitude: '456' } });
});

test('non string', () => {
  expect(validator([123, 456])).toBe(false);
});
