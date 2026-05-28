import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  CircleUserRound,
  Flame,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { WELLBEING_CHANNELS } from './data/seed'
import {
  MOOD_OPTIONS,
  buildHabitSeries,
  buildMoodSeries,
  formatLongDate,
  formatShortDate,
  getAverageMood,
  getCheckInStreak,
  getHistoryRangeLabel,
  getMoodOption,
  getRecommendation,
  getTodayHabitStatus,
  getUserEmotionLogs,
  getUserHabits,
  getVisibleRiskAlert,
  getWeeklyHabitCompletionRate,
  toDateKey,
} from './lib/insights'
import { api } from './lib/api'
import { useAuth } from './lib/AuthContext'
import type {
  EmotionLog,
  Habit,
  HabitFrequency,
  HabitLog,
  ReminderChannel,
  ReminderFrequency,
  UserProfile,
} from './types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
)

const NAV_ITEMS = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/habits', label: 'Hábitos', icon: Target },
  { path: '/app/history', label: 'Historial', icon: LineChart },
  { path: '/app/resources', label: 'Bienestar', icon: HeartPulse },
  { path: '/app/profile', label: 'Perfil', icon: CircleUserRound },
]

const MOOD_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      min: 0,
      max: 5,
      ticks: {
        stepSize: 1,
      },
      grid: {
        color: 'rgba(15, 23, 42, 0.08)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
} as const

const HABIT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
      grid: {
        color: 'rgba(15, 23, 42, 0.08)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
} as const

type HistoryRange = 'day' | 'week' | 'month'

function getHistoryDays(range: HistoryRange) {
  if (range === 'day') {
    return 1
  }

  if (range === 'week') {
    return 7
  }

  return 30
}

function ProtectedRoute({
  user,
  children,
}: {
  user: UserProfile | null
  children: ReactNode
}) {
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export default function App() {
  const { user, login, register, logout } = useAuth()
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [announcement, setAnnouncement] = useState<string | null>(null)

  useEffect(() => {
    if (!announcement) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setAnnouncement(null)
    }, 3600)

    return () => window.clearTimeout(timer)
  }, [announcement])

  useEffect(() => {
    if (!user) {
      setEmotionLogs([])
      setHabits([])
      setHabitLogs([])
      return
    }

    loadAllData()
  }, [user])

  async function loadAllData() {
    try {
      const [emotions, habitsList, logsList] = await Promise.all([
        api.emotionLogs.list(),
        api.habits.list(),
        api.habitLogs.list(),
      ])

      setEmotionLogs(emotions)
      setHabits(habitsList)
      setHabitLogs(logsList)
    } catch {
      console.error('Error al cargar datos del servidor')
    }
  }

  function announce(message: string) {
    setAnnouncement(message)
  }

  async function registerUser(values: {
    displayName: string
    email: string
    password: string
  }) {
    const error = await register(values)

    if (error) {
      return error
    }

    announce('Cuenta creada correctamente.')
    await loadAllData()
    return null
  }

  async function loginUser(emailValue: string, password: string) {
    const error = await login(emailValue, password)

    if (error) {
      return error
    }

    announce('Bienvenida de nuevo.')
    await loadAllData()
    return null
  }

  function logoutUser() {
    logout()
    announce('Sesion cerrada.')
  }

  async function requestPasswordReset(emailValue: string) {
    try {
      await api.auth.resetPassword(emailValue)
      announce(`Se envio el enlace de recuperacion a ${emailValue}.`)
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Error al solicitar recuperacion'
    }
  }

  async function saveEmotion(values: { date: string; score: number; note: string }) {
    try {
      const log = await api.emotionLogs.save(values)
      setEmotionLogs((previous) => {
        const idx = previous.findIndex((e) => e.date === values.date && e.userId === user!.id)
        if (idx >= 0) {
          const updated = [...previous]
          updated[idx] = log
          return updated
        }
        return [...previous, log]
      })
      announce('Check-in emocional guardado.')
    } catch {
      announce('Error al guardar el check-in.')
    }
  }

  async function deleteEmotion(logId: string) {
    try {
      await api.emotionLogs.delete(logId)
      setEmotionLogs((previous) => previous.filter((log) => log.id !== logId))
      announce('Registro emocional eliminado.')
    } catch {
      announce('Error al eliminar el registro.')
    }
  }

  async function saveHabit(values: {
    id?: string
    title: string
    frequency: HabitFrequency
    cue: string
    color: string
  }) {
    if (!values.title.trim()) {
      return 'El habito necesita un titulo corto y claro.'
    }

    try {
      if (values.id) {
        const habit = await api.habits.update(values.id, {
          title: values.title.trim(),
          frequency: values.frequency,
          cue: values.cue.trim(),
          color: values.color,
        })
        setHabits((previous) =>
          previous.map((h) => (h.id === values.id ? habit : h)),
        )
        announce('Habito actualizado.')
      } else {
        const habit = await api.habits.create({
          title: values.title.trim(),
          frequency: values.frequency,
          cue: values.cue.trim(),
          color: values.color,
        })
        setHabits((previous) => [...previous, habit])
        announce('Habito creado.')
      }

      return null
    } catch {
      return 'Error al guardar el habito.'
    }
  }

  async function deleteHabit(habitId: string) {
    try {
      await api.habits.delete(habitId)
      setHabits((previous) => previous.filter((habit) => habit.id !== habitId))
      setHabitLogs((previous) => previous.filter((log) => log.habitId !== habitId))
      announce('Habito eliminado.')
    } catch {
      announce('Error al eliminar el habito.')
    }
  }

  async function toggleHabit(habitId: string, date = toDateKey()) {
    try {
      const existing = habitLogs.find(
        (log) => log.habitId === habitId && log.date === date,
      )

      const log = await api.habitLogs.toggle({
        habitId,
        date,
        completed: existing ? !existing.completed : true,
      })

      setHabitLogs((previous) => {
        const idx = previous.findIndex((l) => l.habitId === habitId && l.date === date)
        if (idx >= 0) {
          const updated = [...previous]
          updated[idx] = log
          return updated
        }
        return [...previous, log]
      })
      announce('Seguimiento de habito actualizado.')
    } catch {
      announce('Error al actualizar el seguimiento.')
    }
  }

  async function saveProfile(values: {
    displayName: string
    university: string
    career: string
    avatarTone: string
  }) {
    try {
      await api.profile.update(values)
      announce('Perfil actualizado.')
    } catch {
      announce('Error al guardar el perfil.')
    }
  }

  async function saveReminder(values: {
    reminderEnabled: boolean
    reminderTime: string
    reminderFrequency: ReminderFrequency
    reminderChannel: ReminderChannel
  }) {
    try {
      await api.profile.updateReminders(values)
      announce('Recordatorios guardados.')
    } catch {
      announce('Error al guardar recordatorios.')
    }
  }

  async function dismissRiskAlert() {
    try {
      await api.profile.dismissAlert()
      announce('Alerta pospuesta durante 48 horas.')
    } catch {
      announce('Error al posponer la alerta.')
    }
  }

  function resetPrototype() {
    announce('Funcion no disponible con el backend conectado.')
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage currentUser={user} />}
      />
      <Route
        path="/auth"
        element={
          <AuthPage
            currentUser={user}
            onLogin={loginUser}
            onRegister={registerUser}
            onPasswordReset={requestPasswordReset}
          />
        }
      />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute user={user}>
            <Workspace
              announcement={announcement}
              currentUser={user!}
              emotionLogs={emotionLogs}
              habitLogs={habitLogs}
              habits={habits}
              onDeleteEmotion={deleteEmotion}
              onDeleteHabit={deleteHabit}
              onDismissRiskAlert={dismissRiskAlert}
              onLogout={logoutUser}
              onResetPrototype={resetPrototype}
              onSaveEmotion={saveEmotion}
              onSaveHabit={saveHabit}
              onSaveProfile={saveProfile}
              onSaveReminder={saveReminder}
              onToggleHabit={toggleHabit}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={user ? '/app' : '/'} replace />}
      />
    </Routes>
  )
}

function LandingPage({ currentUser }: { currentUser: UserProfile | null }) {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">PWA · bienestar estudiantil · mobile first</span>
          <h1>MindBalance</h1>
          <p className="lead">
            Convierte bienestar emocional en una rutina visible.
          </p>
          <div className="hero-actions">
            <NavLink className="button button--primary" to={currentUser ? '/app' : '/auth'}>
              Ingresar
              <ArrowRight size={18} />
            </NavLink>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <FeatureCard
          icon={<HeartPulse size={20} />}
          title="Registro emocional diario"
          description="Escala 1-5, nota opcional, edición posterior y recomendación contextual."
        />
        <FeatureCard
          icon={<Target size={20} />}
          title="Gestión de micro-hábitos"
          description="Creación, edición, eliminación y seguimiento diario con progreso semanal."
        />
        <FeatureCard
          icon={<ShieldAlert size={20} />}
          title="Alertas preventivas"
          description="Detección de patrones de riesgo en los últimos 7 días con opción de posponer."
        />
        <FeatureCard
          icon={<Bell size={20} />}
          title="Recordatorios configurables"
          description="Frecuencia, horario y canal preferido guardados desde la vista de perfil."
        />
      </section>
    </main>
  )
}

function AuthPage({
  currentUser,
  onLogin,
  onRegister,
  onPasswordReset,
}: {
  currentUser: UserProfile | null
  onLogin: (email: string, password: string) => Promise<string | null>
  onRegister: (values: {
    displayName: string
    email: string
    password: string
  }) => Promise<string | null>
  onPasswordReset: (email: string) => Promise<string | null>
}) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login')
  const [message, setMessage] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    email: '',
    password: '',
  })
  const [recoverEmail, setRecoverEmail] = useState('')

  if (currentUser) {
    return <Navigate to="/app" replace />
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = await onLogin(loginForm.email, loginForm.password)
    setMessage(error ?? 'Ingreso correcto. Redirigiendo al dashboard...')
    if (!error) {
      navigate('/app')
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = await onRegister(registerForm)
    setMessage(error ?? 'Cuenta creada correctamente.')
    if (!error) {
      navigate('/app')
    }
  }

  async function handleRecoverySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = await onPasswordReset(recoverEmail)
    setMessage(error ?? 'Si el correo existe, recibirás un enlace de recuperación.')
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-panel--copy">
        <span className="eyebrow">Bienestar estudiantil</span>
        <h1>Ingresa y mantén tu bienestar en seguimiento.</h1>
        <p className="lead">
          Accede a tu cuenta, registra tu estado emocional y mantén visibles tus
          hábitos y recordatorios.
        </p>
      </section>

      <section className="auth-panel auth-panel--form card">
        <div className="tab-row">
          <button
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => setMode('login')}
            type="button"
          >
            Iniciar sesión
          </button>
          <button
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setMode('register')}
            type="button"
          >
            Registrarme
          </button>
          <button
            className={mode === 'recover' ? 'tab active' : 'tab'}
            onClick={() => setMode('recover')}
            type="button"
          >
            Recuperar
          </button>
        </div>

        {mode === 'login' ? (
          <form className="stack-form" onSubmit={handleLoginSubmit}>
            <label>
              Correo institucional
              <input
                onChange={(event) =>
                  setLoginForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                type="email"
                value={loginForm.email}
              />
            </label>
            <label>
              Contraseña
              <input
                onChange={(event) =>
                  setLoginForm((previous) => ({
                    ...previous,
                    password: event.target.value,
                  }))
                }
                type="password"
                value={loginForm.password}
              />
            </label>
            <button className="button button--primary" type="submit">
              Entrar
            </button>
          </form>
        ) : null}

        {mode === 'register' ? (
          <form className="stack-form" onSubmit={handleRegisterSubmit}>
            <label>
              Nombre visible
              <input
                onChange={(event) =>
                  setRegisterForm((previous) => ({
                    ...previous,
                    displayName: event.target.value,
                  }))
                }
                placeholder="Ej. Laura Gómez"
                value={registerForm.displayName}
              />
            </label>
            <label>
              Correo electrónico
              <input
                onChange={(event) =>
                  setRegisterForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                placeholder="nombre@correo.edu.co"
                type="email"
                value={registerForm.email}
              />
            </label>
            <label>
              Contraseña
              <input
                onChange={(event) =>
                  setRegisterForm((previous) => ({
                    ...previous,
                    password: event.target.value,
                  }))
                }
                placeholder="Mínimo 8 caracteres"
                type="password"
                value={registerForm.password}
              />
            </label>
            <button className="button button--primary" type="submit">
              Crear cuenta
            </button>
          </form>
        ) : null}

        {mode === 'recover' ? (
          <form className="stack-form" onSubmit={handleRecoverySubmit}>
            <label>
              Correo registrado
              <input
                onChange={(event) => setRecoverEmail(event.target.value)}
                placeholder="usuario@correo.edu.co"
                type="email"
                value={recoverEmail}
              />
            </label>
            <button className="button button--primary" type="submit">
              Enviar enlace
            </button>
          </form>
        ) : null}

        {message ? <p className="inline-message">{message}</p> : null}
      </section>
    </main>
  )
}

function Workspace({
  announcement,
  currentUser,
  emotionLogs,
  habits,
  habitLogs,
  onDeleteEmotion,
  onDeleteHabit,
  onDismissRiskAlert,
  onLogout,
  onResetPrototype,
  onSaveEmotion,
  onSaveHabit,
  onSaveProfile,
  onSaveReminder,
  onToggleHabit,
}: {
  announcement: string | null
  currentUser: UserProfile
  emotionLogs: EmotionLog[]
  habits: Habit[]
  habitLogs: HabitLog[]
  onDeleteEmotion: (logId: string) => void
  onDeleteHabit: (habitId: string) => void
  onDismissRiskAlert: () => void
  onLogout: () => void
  onResetPrototype: () => void
  onSaveEmotion: (values: { date: string; score: number; note: string }) => void
  onSaveHabit: (values: {
    id?: string
    title: string
    frequency: HabitFrequency
    cue: string
    color: string
  }) => Promise<string | null>
  onSaveProfile: (values: {
    displayName: string
    university: string
    career: string
    avatarTone: string
  }) => void
  onSaveReminder: (values: {
    reminderEnabled: boolean
    reminderTime: string
    reminderFrequency: ReminderFrequency
    reminderChannel: ReminderChannel
  }) => void
  onToggleHabit: (habitId: string, date?: string) => void
}) {
  const location = useLocation()
  const currentLogs = getUserEmotionLogs(emotionLogs, currentUser.id)
  const currentHabits = getUserHabits(habits, currentUser.id)
  const todayHabits = getTodayHabitStatus(habits, habitLogs, currentUser.id)
  const todayEntry =
    currentLogs.find((log) => log.date === toDateKey()) ?? null
  const latestEmotion = currentLogs[0] ?? todayEntry
  const averageMood = getAverageMood(emotionLogs, currentUser.id)
  const streak = getCheckInStreak(emotionLogs, currentUser.id)
  const weeklyHabitRate = getWeeklyHabitCompletionRate(
    habits,
    habitLogs,
    currentUser.id,
  )
  const riskAlert = getVisibleRiskAlert(emotionLogs, currentUser.id, currentUser)
  const moodSeries = buildMoodSeries(emotionLogs, currentUser.id, 7)
  const habitSeries = buildHabitSeries(habits, habitLogs, currentUser.id, 7)

  const dashboardProps = {
    currentUser,
    currentHabits,
    currentLogs,
    habitSeries,
    latestEmotion,
    moodSeries,
    onDismissRiskAlert,
    onSaveEmotion,
    onToggleHabit,
    riskAlert,
    streak,
    todayEntry,
    todayHabits,
    weeklyHabitRate,
    averageMood,
  }

  const habitsProps = {
    currentHabits,
    currentUser,
    onDeleteHabit,
    onSaveHabit,
    onToggleHabit,
    todayHabits,
  }

  const historyProps = {
    currentLogs,
    currentHabits,
    habitLogs,
    onDeleteEmotion,
    onSaveEmotion,
    onToggleHabit,
    userId: currentUser.id,
  }

  const profileProps = {
    currentUser,
    onResetPrototype,
    onSaveProfile,
    onSaveReminder,
  }

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div className="workspace-title">
          <span className="eyebrow">MindBalance</span>
          <h2>Hola, {currentUser.displayName.split(' ')[0]}</h2>
          <p>
            {formatLongDate(toDateKey())}. Mantén tu registro emocional y tus hábitos
            visibles.
          </p>
        </div>
        <div className="workspace-actions">
          <div className="avatar-chip">
            <span
              className="avatar-chip__dot"
              style={{ backgroundColor: currentUser.avatarTone }}
            />
            <span>{currentUser.reminderTime}</span>
          </div>
          <button className="button button--ghost" onClick={onLogout} type="button">
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {announcement ? <div className="announcement">{announcement}</div> : null}

      <div className="workspace-frame">
        <aside className="workspace-nav card">
          <p className="kicker">Navegación principal</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'workspace-nav__link active' : 'workspace-nav__link'
                }
                end={item.path === '/app'}
                key={item.path}
                to={item.path}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </aside>

        <section className="workspace-main">
          <div className="summary-grid">
            <MetricCard
              icon={<Sparkles size={18} />}
              label="Promedio emocional"
              value={averageMood ? `${averageMood}/5` : 'Sin datos'}
            />
            <MetricCard
              icon={<Flame size={18} />}
              label="Racha de check-in"
              value={`${streak} días`}
            />
            <MetricCard
              icon={<Target size={18} />}
              label="Cumplimiento semanal"
              value={`${weeklyHabitRate}%`}
            />
            <MetricCard
              icon={<Bell size={18} />}
              label="Recordatorio"
              value={
                currentUser.reminderEnabled
                  ? `${currentUser.reminderFrequency} · ${currentUser.reminderTime}`
                  : 'Desactivado'
              }
            />
          </div>

          {location.pathname === '/app' ? <DashboardPage {...dashboardProps} /> : null}
          {location.pathname === '/app/habits' ? <HabitsPage {...habitsProps} /> : null}
          {location.pathname === '/app/history' ? <HistoryPage {...historyProps} /> : null}
          {location.pathname === '/app/resources' ? <ResourcesPage latestEmotion={latestEmotion} /> : null}
          {location.pathname === '/app/profile' ? <ProfilePage {...profileProps} /> : null}
        </section>
      </div>
    </div>
  )
}

function DashboardPage({
  averageMood,
  currentHabits,
  currentLogs,
  currentUser,
  habitSeries,
  latestEmotion,
  moodSeries,
  onDismissRiskAlert,
  onSaveEmotion,
  onToggleHabit,
  riskAlert,
  streak,
  todayEntry,
  todayHabits,
  weeklyHabitRate,
}: {
  averageMood: number
  currentHabits: Habit[]
  currentLogs: EmotionLog[]
  currentUser: UserProfile
  habitSeries: Array<{ dateKey: string; label: string; completed: number; total: number }>
  latestEmotion: EmotionLog | null
  moodSeries: Array<{ dateKey: string; label: string; score: number }>
  onDismissRiskAlert: () => void
  onSaveEmotion: (values: { date: string; score: number; note: string }) => void
  onToggleHabit: (habitId: string, date?: string) => void
  riskAlert: { title: string; message: string; affectedDates: string } | null
  streak: number
  todayEntry: EmotionLog | null
  todayHabits: Array<Habit & { completed: boolean }>
  weeklyHabitRate: number
}) {
  const [selectedScore, setSelectedScore] = useState(todayEntry?.score ?? 3)
  const [note, setNote] = useState(todayEntry?.note ?? '')

  useEffect(() => {
    setSelectedScore(todayEntry?.score ?? 3)
    setNote(todayEntry?.note ?? '')
  }, [todayEntry])

  const recommendation = getRecommendation(latestEmotion?.score ?? selectedScore)
  const moodChartData = {
    labels: moodSeries.map((item) => item.label),
    datasets: [
      {
        label: 'Estado de ánimo',
        data: moodSeries.map((item) => (item.score === 0 ? null : item.score)),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.18)',
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        fill: true,
        tension: 0.35,
        spanGaps: true,
      },
    ],
  }

  const habitChartData = {
    labels: habitSeries.map((item) => item.label),
    datasets: [
      {
        label: 'Hábitos completados',
        data: habitSeries.map((item) => item.completed),
        backgroundColor: '#f97316',
        borderRadius: 12,
      },
    ],
  }

  function handleSaveEmotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSaveEmotion({
      date: toDateKey(),
      score: selectedScore,
      note,
    })
  }

  return (
    <div className="page-stack">
      {riskAlert ? (
        <section className="alert-banner">
          <div>
            <p className="kicker">Alerta preventiva</p>
            <h3>{riskAlert.title}</h3>
            <p>{riskAlert.message}</p>
            <small>Días afectados: {riskAlert.affectedDates}</small>
          </div>
          <button className="button button--ghost" onClick={onDismissRiskAlert} type="button">
            Posponer 48h
          </button>
        </section>
      ) : null}

      <div className="content-grid">
        <section className="card section-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Check-in emocional</p>
              <h3>¿Cómo te sientes hoy?</h3>
            </div>
            <span className="pill">{todayEntry ? 'Registro editable' : 'Nuevo registro'}</span>
          </div>
          <form className="stack-form" onSubmit={handleSaveEmotion}>
            <div className="mood-grid">
              {MOOD_OPTIONS.map((option) => (
                <button
                  className={
                    selectedScore === option.score
                      ? 'mood-card active'
                      : 'mood-card'
                  }
                  key={option.score}
                  onClick={() => setSelectedScore(option.score)}
                  type="button"
                >
                  <span>{option.emoji}</span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
            <label>
              Nota opcional
              <textarea
                onChange={(event) => setNote(event.target.value)}
                placeholder="Describe brevemente qué detonó tu estado de hoy."
                rows={4}
                value={note}
              />
            </label>
            <button className="button button--primary" type="submit">
              <Save size={16} />
              Guardar check-in
            </button>
          </form>
        </section>

        <section className="card section-card section-card--accent">
          <div className="section-heading">
            <div>
              <p className="kicker">Recomendación personalizada</p>
              <h3>{recommendation.title}</h3>
            </div>
            <Sparkles size={18} />
          </div>
          <p>{recommendation.description}</p>
          <div className="recommendation-box">
            <strong>Acción sugerida</strong>
            <p>{recommendation.action}</p>
          </div>
          <div className="quick-stats">
            <div>
              <span>{averageMood ? `${averageMood}/5` : 'Sin datos'}</span>
              <small>Promedio últimos registros</small>
            </div>
            <div>
              <span>{streak} días</span>
              <small>Racha de check-in</small>
            </div>
            <div>
              <span>{weeklyHabitRate}%</span>
              <small>Cumplimiento semanal</small>
            </div>
          </div>
        </section>
      </div>

      <div className="content-grid">
        <section className="card chart-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Visualización de información</p>
              <h3>Evolución emocional de los últimos 7 días</h3>
            </div>
          </div>
          <div className="chart-slot">
            <Line data={moodChartData} options={MOOD_CHART_OPTIONS} />
          </div>
        </section>

        <section className="card chart-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Seguimiento de hábitos</p>
              <h3>Cumplimiento diario</h3>
            </div>
          </div>
          <div className="chart-slot">
            <Bar data={habitChartData} options={HABIT_CHART_OPTIONS} />
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <p className="kicker">Interacción básica</p>
            <h3>Hábitos de hoy</h3>
          </div>
          <span className="pill">{todayHabits.filter((habit) => habit.completed).length}/{todayHabits.length} completados</span>
        </div>
        {todayHabits.length === 0 ? (
          <EmptyState
            title="Aún no has creado hábitos"
            description="Ve a la sección de hábitos y registra tu primera meta corta."
          />
        ) : (
          <div className="habit-list">
            {todayHabits.map((habit) => (
              <button
                className={habit.completed ? 'habit-item active' : 'habit-item'}
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                type="button"
              >
                <span
                  className="habit-color"
                  style={{ backgroundColor: habit.color }}
                />
                <div>
                  <strong>{habit.title}</strong>
                  <small>
                    {habit.frequency} · Disparador: {habit.cue || 'No definido'}
                  </small>
                </div>
                <CheckCircle2 size={18} />
              </button>
            ))}
          </div>
        )}

        <div className="note-strip">
          <strong>Resumen del usuario</strong>
          <p>
            {currentUser.displayName} tiene {currentHabits.length} hábitos activos y{' '}
            {currentLogs.length} registros emocionales acumulados.
          </p>
        </div>
      </section>
    </div>
  )
}

function HabitsPage({
  currentHabits,
  currentUser,
  onDeleteHabit,
  onSaveHabit,
  onToggleHabit,
  todayHabits,
}: {
  currentHabits: Habit[]
  currentUser: UserProfile
  onDeleteHabit: (habitId: string) => void
  onSaveHabit: (values: {
    id?: string
    title: string
    frequency: HabitFrequency
    cue: string
    color: string
  }) => Promise<string | null>
  onToggleHabit: (habitId: string, date?: string) => void
  todayHabits: Array<Habit & { completed: boolean }>
}) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    frequency: 'Diario' as HabitFrequency,
    cue: '',
    color: '#0f766e',
  })

  useEffect(() => {
    if (editingHabit) {
      setForm({
        title: editingHabit.title,
        frequency: editingHabit.frequency,
        cue: editingHabit.cue,
        color: editingHabit.color,
      })
      return
    }

    setForm({
      title: '',
      frequency: 'Diario',
      cue: '',
      color: '#0f766e',
    })
  }, [editingHabit])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = await onSaveHabit({
      id: editingHabit?.id,
      ...form,
    })
    setMessage(error ?? (editingHabit ? 'Hábito actualizado.' : 'Hábito creado.'))
    if (!error) {
      setEditingHabit(null)
    }
  }

  function handleDelete(habitId: string) {
    if (!window.confirm('¿Eliminar este hábito y su historial asociado?')) {
      return
    }

    onDeleteHabit(habitId)
    if (editingHabit?.id === habitId) {
      setEditingHabit(null)
    }
  }

  return (
    <div className="page-stack">
      <div className="content-grid">
        <section className="card section-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Gestión de contenido</p>
              <h3>{editingHabit ? 'Editar hábito' : 'Crear micro-hábito'}</h3>
            </div>
            <span className="pill">{currentUser.career}</span>
          </div>
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Título del hábito
              <input
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="Ej. Pausa de respiración antes de clase"
                value={form.title}
              />
            </label>
            <label>
              Frecuencia
              <select
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    frequency: event.target.value as HabitFrequency,
                  }))
                }
                value={form.frequency}
              >
                <option>Diario</option>
                <option>Lunes a viernes</option>
                <option>3 veces por semana</option>
              </select>
            </label>
            <label>
              Disparador o recordatorio
              <input
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    cue: event.target.value,
                  }))
                }
                placeholder="Ej. Justo antes de abrir el correo"
                value={form.cue}
              />
            </label>
            <label>
              Color de identificación
              <input
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    color: event.target.value,
                  }))
                }
                type="color"
                value={form.color}
              />
            </label>
            <div className="button-row">
              <button className="button button--primary" type="submit">
                {editingHabit ? <Save size={16} /> : <Plus size={16} />}
                {editingHabit ? 'Guardar cambios' : 'Agregar hábito'}
              </button>
              {editingHabit ? (
                <button
                  className="button button--ghost"
                  onClick={() => setEditingHabit(null)}
                  type="button"
                >
                  Cancelar edición
                </button>
              ) : null}
            </div>
          </form>
          {message ? <p className="inline-message">{message}</p> : null}
        </section>

        <section className="card section-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Seguimiento diario</p>
              <h3>Estado de hoy</h3>
            </div>
            <span className="pill">
              {todayHabits.filter((habit) => habit.completed).length}/{todayHabits.length}
            </span>
          </div>
          <div className="habit-list">
            {todayHabits.map((habit) => (
              <button
                className={habit.completed ? 'habit-item active' : 'habit-item'}
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                type="button"
              >
                <span className="habit-color" style={{ backgroundColor: habit.color }} />
                <div>
                  <strong>{habit.title}</strong>
                  <small>{habit.frequency}</small>
                </div>
                <CheckCircle2 size={18} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <p className="kicker">Lista de hábitos activos</p>
            <h3>{currentHabits.length} hábitos personalizados</h3>
          </div>
        </div>
        {currentHabits.length === 0 ? (
          <EmptyState
            title="Todavía no hay hábitos"
            description="Empieza con acciones pequeñas y repetibles para hacer visible tu progreso."
          />
        ) : (
          <div className="list-grid">
            {currentHabits.map((habit) => (
              <article className="habit-card" key={habit.id}>
                <div className="habit-card__header">
                  <span className="habit-color" style={{ backgroundColor: habit.color }} />
                  <span className="pill">{habit.frequency}</span>
                </div>
                <h4>{habit.title}</h4>
                <p>{habit.cue || 'Sin disparador definido.'}</p>
                <div className="button-row">
                  <button
                    className="button button--ghost"
                    onClick={() => setEditingHabit(habit)}
                    type="button"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    className="button button--danger"
                    onClick={() => handleDelete(habit.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function HistoryPage({
  currentHabits,
  currentLogs,
  habitLogs,
  onDeleteEmotion,
  onSaveEmotion,
  onToggleHabit,
  userId,
}: {
  currentHabits: Habit[]
  currentLogs: EmotionLog[]
  habitLogs: HabitLog[]
  onDeleteEmotion: (logId: string) => void
  onSaveEmotion: (values: { date: string; score: number; note: string }) => void
  onToggleHabit: (habitId: string, date?: string) => void
  userId: string
}) {
  const [range, setRange] = useState<HistoryRange>('week')
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState(3)
  const [editNote, setEditNote] = useState('')
  const days = getHistoryDays(range)
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  const filteredLogs = currentLogs.filter(
    (log) => new Date(`${log.date}T00:00:00`) >= cutoff,
  )
  const filteredHabitLogs = habitLogs
    .filter(
      (log) =>
        log.userId === userId &&
        log.completed &&
        new Date(`${log.date}T00:00:00`) >= cutoff,
    )
    .sort((first, second) => second.date.localeCompare(first.date))
  const editingLog =
    filteredLogs.find((log) => log.id === editingLogId) ?? null

  useEffect(() => {
    if (!editingLog) {
      return
    }

    setEditScore(editingLog.score)
    setEditNote(editingLog.note ?? '')
  }, [editingLog])

  function handleDelete(logId: string) {
    if (!window.confirm('¿Eliminar este registro emocional?')) {
      return
    }

    onDeleteEmotion(logId)
    if (editingLogId === logId) {
      setEditingLogId(null)
    }
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingLog) {
      return
    }

    onSaveEmotion({
      date: editingLog.date,
      score: editScore,
      note: editNote,
    })
    setEditingLogId(null)
  }

  return (
    <div className="page-stack">
      <section className="card section-card">
        <div className="section-heading">
          <div>
            <p className="kicker">Historial emocional</p>
            <h3>{getHistoryRangeLabel(range)}</h3>
          </div>
          <div className="tab-row compact">
            <button className={range === 'day' ? 'tab active' : 'tab'} onClick={() => setRange('day')} type="button">
              Día
            </button>
            <button className={range === 'week' ? 'tab active' : 'tab'} onClick={() => setRange('week')} type="button">
              Semana
            </button>
            <button className={range === 'month' ? 'tab active' : 'tab'} onClick={() => setRange('month')} type="button">
              Mes
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No hay registros en este rango"
            description="Haz un check-in para empezar a construir tu historial."
          />
        ) : (
          <div className="history-list">
            {filteredLogs.map((log) => {
              const mood = getMoodOption(log.score)
              return (
                <article className="history-card" key={log.id}>
                  <div>
                    <span className="history-card__emoji">{mood.emoji}</span>
                    <div>
                      <strong>{formatLongDate(log.date)}</strong>
                      <small>{mood.label} · {log.score}/5</small>
                    </div>
                  </div>
                  <p>{log.note || 'Sin nota adicional.'}</p>
                  <div className="button-row">
                    <button
                      className="button button--ghost"
                      onClick={() => setEditingLogId(log.id)}
                      type="button"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      className="button button--danger"
                      onClick={() => handleDelete(log.id)}
                      type="button"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {editingLog ? (
        <section className="card section-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Edición de registros</p>
              <h3>{formatShortDate(editingLog.date)}</h3>
            </div>
          </div>
          <form className="stack-form" onSubmit={handleEditSubmit}>
            <label>
              Nivel emocional
              <select
                onChange={(event) => setEditScore(Number(event.target.value))}
                value={editScore}
              >
                {MOOD_OPTIONS.map((option) => (
                  <option key={option.score} value={option.score}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nota
              <textarea
                onChange={(event) => setEditNote(event.target.value)}
                rows={4}
                value={editNote}
              />
            </label>
            <div className="button-row">
              <button className="button button--primary" type="submit">
                <Save size={16} />
                Guardar edición
              </button>
              <button
                className="button button--ghost"
                onClick={() => setEditingLogId(null)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <p className="kicker">Historial de hábitos</p>
            <h3>Cumplimientos registrados</h3>
          </div>
        </div>
        {filteredHabitLogs.length === 0 ? (
          <EmptyState
            title="Sin seguimiento registrado"
            description="Marca hábitos como completados para verlos reflejados aquí."
          />
        ) : (
          <div className="history-list">
            {filteredHabitLogs.map((log) => {
              const habit = currentHabits.find((item) => item.id === log.habitId)
              if (!habit) {
                return null
              }

              return (
                <article className="history-card" key={log.id}>
                  <div>
                    <span
                      className="habit-color"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div>
                      <strong>{habit.title}</strong>
                      <small>{formatLongDate(log.date)}</small>
                    </div>
                  </div>
                  <div className="button-row">
                    <button
                      className="button button--ghost"
                      onClick={() => onToggleHabit(log.habitId, log.date)}
                      type="button"
                    >
                      Deshacer
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function ResourcesPage({ latestEmotion }: { latestEmotion: EmotionLog | null }) {
  const recommendation = getRecommendation(latestEmotion?.score ?? 3)

  return (
    <div className="page-stack">
      <section className="card section-card section-card--accent">
        <div className="section-heading">
          <div>
            <p className="kicker">Apoyo institucional</p>
            <h3>Canales de bienestar estudiantil</h3>
          </div>
          <Mail size={18} />
        </div>
        <p>
          Esta pantalla cubre RF10 y soporta la interacción básica de acceso a
          contacto, agenda de citas y activación de apoyo preventivo.
        </p>
      </section>

      <div className="list-grid">
        {WELLBEING_CHANNELS.map((channel) => (
          <article className="resource-card" key={channel.id}>
            <span className="pill">{channel.type}</span>
            <h4>{channel.name}</h4>
            <p>{channel.description}</p>
            <small>{channel.availability}</small>
            <a className="button button--primary" href={channel.link}>
              {channel.contactLabel}
            </a>
            <span className="resource-contact">{channel.contactValue}</span>
          </article>
        ))}
      </div>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <p className="kicker">Recomendación vigente</p>
            <h3>{recommendation.title}</h3>
          </div>
          <ShieldAlert size={18} />
        </div>
        <p>{recommendation.description}</p>
        <div className="note-strip">
          <strong>Cuando escalar</strong>
          <p>
            Si el ánimo bajo persiste durante varios días, la pauta recomendada es
            contactar bienestar o activar la línea institucional.
          </p>
        </div>
      </section>
    </div>
  )
}

function ProfilePage({
  currentUser,
  onResetPrototype,
  onSaveProfile,
  onSaveReminder,
}: {
  currentUser: UserProfile
  onResetPrototype: () => void
  onSaveProfile: (values: {
    displayName: string
    university: string
    career: string
    avatarTone: string
  }) => void
  onSaveReminder: (values: {
    reminderEnabled: boolean
    reminderTime: string
    reminderFrequency: ReminderFrequency
    reminderChannel: ReminderChannel
  }) => void
}) {
  const [profileForm, setProfileForm] = useState({
    displayName: currentUser.displayName,
    university: currentUser.university,
    career: currentUser.career,
    avatarTone: currentUser.avatarTone,
  })
  const [reminderForm, setReminderForm] = useState({
    reminderEnabled: currentUser.reminderEnabled,
    reminderTime: currentUser.reminderTime,
    reminderFrequency: currentUser.reminderFrequency,
    reminderChannel: currentUser.reminderChannel,
  })

  useEffect(() => {
    setProfileForm({
      displayName: currentUser.displayName,
      university: currentUser.university,
      career: currentUser.career,
      avatarTone: currentUser.avatarTone,
    })
    setReminderForm({
      reminderEnabled: currentUser.reminderEnabled,
      reminderTime: currentUser.reminderTime,
      reminderFrequency: currentUser.reminderFrequency,
      reminderChannel: currentUser.reminderChannel,
    })
  }, [currentUser])

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSaveProfile(profileForm)
  }

  function handleReminderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSaveReminder(reminderForm)
  }

  return (
    <div className="page-stack">
      <div className="content-grid">
        <section className="card section-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Edición de perfil</p>
              <h3>Información del estudiante</h3>
            </div>
          </div>
          <form className="stack-form" onSubmit={handleProfileSubmit}>
            <label>
              Nombre visible
              <input
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    displayName: event.target.value,
                  }))
                }
                value={profileForm.displayName}
              />
            </label>
            <label>
              Institución
              <input
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    university: event.target.value,
                  }))
                }
                value={profileForm.university}
              />
            </label>
            <label>
              Programa académico
              <input
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    career: event.target.value,
                  }))
                }
                value={profileForm.career}
              />
            </label>
            <label>
              Color del avatar
              <input
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    avatarTone: event.target.value,
                  }))
                }
                type="color"
                value={profileForm.avatarTone}
              />
            </label>
            <button className="button button--primary" type="submit">
              <Save size={16} />
              Guardar perfil
            </button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-heading">
            <div>
              <p className="kicker">Configuración de recordatorios</p>
              <h3>Preferencias de notificación</h3>
            </div>
          </div>
          <form className="stack-form" onSubmit={handleReminderSubmit}>
            <label className="switch-row">
              <span>Activar recordatorios</span>
              <input
                checked={reminderForm.reminderEnabled}
                onChange={(event) =>
                  setReminderForm((previous) => ({
                    ...previous,
                    reminderEnabled: event.target.checked,
                  }))
                }
                type="checkbox"
              />
            </label>
            <label>
              Hora preferida
              <input
                onChange={(event) =>
                  setReminderForm((previous) => ({
                    ...previous,
                    reminderTime: event.target.value,
                  }))
                }
                type="time"
                value={reminderForm.reminderTime}
              />
            </label>
            <label>
              Frecuencia
              <select
                onChange={(event) =>
                  setReminderForm((previous) => ({
                    ...previous,
                    reminderFrequency: event.target.value as ReminderFrequency,
                  }))
                }
                value={reminderForm.reminderFrequency}
              >
                <option>Diario</option>
                <option>Lunes a viernes</option>
                <option>Personalizado</option>
              </select>
            </label>
            <label>
              Canal
              <select
                onChange={(event) =>
                  setReminderForm((previous) => ({
                    ...previous,
                    reminderChannel: event.target.value as ReminderChannel,
                  }))
                }
                value={reminderForm.reminderChannel}
              >
                <option>Push</option>
                <option>Correo</option>
              </select>
            </label>
            <button className="button button--primary" type="submit">
              <Bell size={16} />
              Guardar recordatorios
            </button>
          </form>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <p className="kicker">Datos de la cuenta</p>
            <h3>Restablecer información</h3>
          </div>
        </div>
        <p>
          Restaura la información guardada y vuelve al estado inicial de la cuenta.
        </p>
        <button className="button button--danger" onClick={onResetPrototype} type="button">
          Restablecer datos
        </button>
      </section>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <article className="metric-card card">
      <div className="metric-card__icon">{icon}</div>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <article className="card feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}
