import { expect, test } from '@playwright/test'

test('smoke', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Wraith CI' })).toBeVisible()
})
