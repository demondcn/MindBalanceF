import { expect, test } from '@playwright/test'

test('carga la pagina principal y muestra el valor de MindBalance', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'MindBalance' })).toBeVisible()
  await expect(page.getByText('Convierte bienestar emocional en una rutina visible.')).toBeVisible()
  await expect(page.getByText('Registro emocional diario')).toBeVisible()
  await expect(page.getByText('Gestión de micro-hábitos')).toBeVisible()
})
