import { expect, test } from '@playwright/test'

test('navega por autenticacion, registro y recuperacion', async ({ page }) => {
  await page.goto('/auth')

  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  await page.getByRole('button', { name: 'Registrarme' }).click()
  await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
  await expect(page.getByLabel('Nombre visible')).toBeVisible()

  await page.getByRole('button', { name: 'Recuperar' }).click()
  await expect(page.getByRole('button', { name: 'Solicitar recuperacion' })).toBeVisible()
  await expect(page.getByLabel('Correo registrado')).toBeVisible()
})
