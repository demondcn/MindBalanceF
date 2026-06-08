import swaggerJSDoc from 'swagger-jsdoc'

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'MindBalance API',
    version: '1.0.0',
    description: 'API para autenticacion, bienestar emocional, habitos, perfil y dashboard de MindBalance.',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor actual',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error del servidor' },
        },
      },
      PublicUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-123' },
          email: { type: 'string', format: 'email', example: 'laura@correo.edu.co' },
          displayName: { type: 'string', example: 'Laura Gomez' },
          avatarUrl: { type: 'string', nullable: true, example: null },
          avatarTone: { type: 'string', example: '#0f766e' },
          university: { type: 'string', example: 'Corporacion Universitaria Iberoamericana' },
          career: { type: 'string', example: 'Psicologia' },
          reminderEnabled: { type: 'boolean', example: true },
          reminderTime: { type: 'string', example: '20:00' },
          reminderFrequency: { type: 'string', example: 'Diario' },
          reminderChannel: { type: 'string', example: 'Push' },
          riskAlertDismissedUntil: { type: 'string', nullable: true, example: '2026-06-08' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-06-07T18:00:00.000Z' },
        },
      },
      AuthPayload: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'laura@correo.edu.co' },
          password: { type: 'string', minLength: 8, example: 'mindbalance123' },
        },
      },
      RegisterPayload: {
        allOf: [
          { $ref: '#/components/schemas/AuthPayload' },
          {
            type: 'object',
            required: ['displayName'],
            properties: {
              displayName: { type: 'string', example: 'Laura Gomez' },
            },
          },
        ],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/PublicUser' },
          token: { type: 'string', example: 'jwt-token-demo' },
        },
      },
      EmotionLog: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'emo-123' },
          userId: { type: 'string', example: 'user-123' },
          date: { type: 'string', format: 'date', example: '2026-06-07' },
          score: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          note: { type: 'string', nullable: true, example: 'Dormi mejor que ayer.' },
        },
      },
      EmotionLogPayload: {
        type: 'object',
        required: ['date', 'score'],
        properties: {
          date: { type: 'string', format: 'date', example: '2026-06-07' },
          score: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          note: { type: 'string', example: 'Me senti mas tranquila.' },
        },
      },
      Habit: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'habit-123' },
          userId: { type: 'string', example: 'user-123' },
          title: { type: 'string', example: 'Respirar 5 minutos' },
          frequency: { type: 'string', example: 'Diario' },
          cue: { type: 'string', nullable: true, example: 'Antes de abrir el correo' },
          color: { type: 'string', nullable: true, example: '#0f766e' },
          isActive: { type: 'boolean', example: true },
          isArchived: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2026-06-07T18:00:00.000Z' },
        },
      },
      HabitPayload: {
        type: 'object',
        required: ['title', 'frequency'],
        properties: {
          title: { type: 'string', example: 'Respirar 5 minutos' },
          frequency: { type: 'string', example: 'Diario' },
          cue: { type: 'string', example: 'Antes de abrir el correo' },
          color: { type: 'string', example: '#0f766e' },
        },
      },
      HabitLog: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'habit-log-123' },
          habitId: { type: 'string', example: 'habit-123' },
          userId: { type: 'string', example: 'user-123' },
          date: { type: 'string', format: 'date', example: '2026-06-07' },
          completed: { type: 'boolean', example: true },
        },
      },
      HabitLogPayload: {
        type: 'object',
        required: ['habitId', 'date'],
        properties: {
          habitId: { type: 'string', example: 'habit-123' },
          date: { type: 'string', format: 'date', example: '2026-06-07' },
          completed: { type: 'boolean', example: true },
        },
      },
      Recommendation: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'rec-123' },
          emotionLevel: { type: 'integer', minimum: 1, maximum: 5, example: 2 },
          title: { type: 'string', example: 'Pide una pausa breve' },
          content: { type: 'string', example: 'Baja la carga y prioriza una accion pequena.' },
          action: { type: 'string', example: 'Respira, hidratarte y hablar con bienestar.' },
          category: { type: 'string', example: 'autocuidado' },
        },
      },
      ProfilePayload: {
        type: 'object',
        properties: {
          displayName: { type: 'string', example: 'Laura Gomez' },
          avatarTone: { type: 'string', example: '#0f766e' },
          university: { type: 'string', example: 'Corporacion Universitaria Iberoamericana' },
          career: { type: 'string', example: 'Psicologia' },
        },
      },
      ReminderPayload: {
        type: 'object',
        properties: {
          reminderEnabled: { type: 'boolean', example: true },
          reminderTime: { type: 'string', example: '20:00' },
          reminderFrequency: { type: 'string', example: 'Diario' },
          reminderChannel: { type: 'string', example: 'Push' },
        },
      },
      DashboardResponse: {
        type: 'object',
        properties: {
          average: { type: 'number', nullable: true, example: 3.7 },
          streak: { type: 'integer', example: 2 },
          riskAlert: { type: 'boolean', example: false },
          todayEmotion: {
            nullable: true,
            type: 'object',
            properties: {
              score: { type: 'integer', example: 4 },
              note: { type: 'string', nullable: true, example: 'Me senti con energia.' },
            },
          },
          habitsCompleted: { type: 'integer', example: 1 },
          habitsTotal: { type: 'integer', example: 2 },
          emotionSeries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date', example: '2026-06-07' },
                score: { type: 'integer', example: 4 },
              },
            },
          },
          habitSeries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date', example: '2026-06-07' },
                habitId: { type: 'string', example: 'habit-123' },
                completed: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Estado general de la API',
        responses: {
          200: {
            description: 'API operativa',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Registrar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cuenta creada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Iniciar sesion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Sesion iniciada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Credenciales invalidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Solicitar recuperacion de contrasena',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'laura@correo.edu.co' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Solicitud registrada',
          },
          400: {
            description: 'Correo no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/reset-password/confirm': {
      post: {
        summary: 'Confirmar recuperacion de contrasena',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string', example: 'token-demo' },
                  newPassword: { type: 'string', minLength: 8, example: 'mindbalance456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Contrasena actualizada',
          },
          400: {
            description: 'Token invalido o datos incorrectos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/emotion-logs': {
      get: {
        summary: 'Listar registros emocionales',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'days',
            schema: { type: 'integer', example: 7 },
            required: false,
          },
        ],
        responses: {
          200: {
            description: 'Lista de registros',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    logs: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EmotionLog' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Crear o actualizar check-in emocional del dia',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmotionLogPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Registro guardado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    log: { $ref: '#/components/schemas/EmotionLog' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/emotion-logs/today': {
      get: {
        summary: 'Obtener registro emocional de hoy',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Registro encontrado o nulo',
          },
        },
      },
    },
    '/api/emotion-logs/{id}': {
      delete: {
        summary: 'Eliminar registro emocional',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Registro eliminado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/habits': {
      get: {
        summary: 'Listar habitos',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'active',
            schema: { type: 'boolean', example: true },
            required: false,
          },
        ],
        responses: {
          200: {
            description: 'Lista de habitos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    habits: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Habit' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Crear habito',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HabitPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Habito creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    habit: { $ref: '#/components/schemas/Habit' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/habits/{id}': {
      put: {
        summary: 'Actualizar habito',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HabitPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Habito actualizado',
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Eliminar habito',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Habito eliminado',
          },
          404: {
            description: 'No encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/habit-logs': {
      get: {
        summary: 'Listar seguimiento de habitos',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'date',
            schema: { type: 'string', format: 'date', example: '2026-06-07' },
            required: false,
          },
        ],
        responses: {
          200: {
            description: 'Lista de seguimientos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    logs: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/HabitLog' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Crear o alternar seguimiento de habito',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HabitLogPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Seguimiento guardado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    log: { $ref: '#/components/schemas/HabitLog' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/recommendations': {
      get: {
        summary: 'Obtener recomendaciones segun nivel emocional',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'emotion',
            schema: { type: 'integer', minimum: 1, maximum: 5, example: 2 },
            required: true,
          },
        ],
        responses: {
          200: {
            description: 'Recomendaciones encontradas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    recommendations: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Recommendation' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Nivel emocional invalido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/dashboard': {
      get: {
        summary: 'Resumen del dashboard con alertas y metricas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Insights del dashboard',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardResponse' },
              },
            },
          },
        },
      },
    },
    '/api/profile/me': {
      get: {
        summary: 'Obtener perfil actual',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/PublicUser' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Actualizar perfil actual',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfilePayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Perfil actualizado',
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/profile/me/reminders': {
      put: {
        summary: 'Actualizar preferencias de recordatorio',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReminderPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Recordatorios actualizados',
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/profile/me/dismiss-alert': {
      put: {
        summary: 'Posponer alerta preventiva',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Alerta pospuesta',
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
}

export function getSwaggerSpec() {
  return swaggerJSDoc({
    definition,
    apis: [],
  })
}
