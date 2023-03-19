test('helmtest', async () => {
  const result = await helmtest.renderTemplate();
  expect(result.length).toBe(4);
});
