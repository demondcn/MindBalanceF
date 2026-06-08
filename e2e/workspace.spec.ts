import { expect, test } from '@playwright/test'

test('abre el workspace autenticado y navega por secciones principales', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('mindbalance-token', 'playwright-token')
  })

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())

    if (url.pathname.endsWith('/api/profile/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-1',
            email: 'laura@correo.edu.co',
            password: '',
            displayName: 'Laura Gomez',
            avatarTone: '#0f766e',
            university: 'Iberoamericana',
            career: 'Psicologia',
            reminderEnabled: true,
            reminderTime: '20:00',
            reminderFrequency: 'Diario',
            reminderChannel: 'Push',
            riskAlertDismissedUntil: null,
            createdAt: '2026-06-07T12:00:00.000Z',
          },
        }),
      })
    }

    if (url.pathname.endsWith('/api/emotion-logs')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logs: [
            {
              id: 'emo-1',
              userId: 'user-1',
              date: '2026-06-07',
              score: 4,
              note: 'Me senti con energia.',
            },
          ],
        }),
      })
    }

    if (url.pathname.endsWith('/api/habits')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          habits: [
            {
              id: 'habit-1',
              userId: 'user-1',
              title: 'Respirar 5 minutos',
              frequency: 'Diario',
              cue: 'Antes de clase',
              color: '#0f766e',
              isArchived: false,
              createdAt: '2026-06-07T12:00:00.000Z',
            },
          ],
        }),
      })
    }

    if (url.pathname.endsWith('/api/habit-logs')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logs: [
            {
              id: 'hl-1',
              habitId: 'habit-1',
              userId: 'user-1',
              date: '2026-06-07',
              completed: true,
            },
          ],
        }),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })

  await page.goto('/app')

  await expect(page.getByRole('heading', { name: /Hola, Laura/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: '¿Cómo te sientes hoy?' })).toBeVisible()

  await page.getByRole('link', { name: 'Hábitos' }).click()
  await expect(page.getByRole('heading', { name: 'Estado de hoy' })).toBeVisible()

  await page.getByRole('link', { name: 'Historial' }).click()
  await expect(page.getByRole('heading', { name: 'Cumplimientos registrados' })).toBeVisible()

  await page.getByRole('link', { name: 'Bienestar' }).click()
  await expect(page.getByRole('heading', { name: 'Canales de bienestar estudiantil' })).toBeVisible()

  await page.getByRole('link', { name: 'Perfil' }).click()
  await expect(page.getByRole('heading', { name: 'Información del estudiante' })).toBeVisible()
})
