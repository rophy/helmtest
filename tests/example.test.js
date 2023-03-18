const helmtest = require('../lib/helmtest');

test('helmtest', async () => {
  const result = await helmtest.renderTemplate({chartDir: 'exampleChart'});
  expect(result.length).toBe(4);
});
