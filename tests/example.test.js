const helmtest = require('../lib/helmtest');

test('helmtest', async () => {
  const result = await helmtest.renderTemplate(null, null, 'exampleChart', 'release123');
  console.log(result);
});
