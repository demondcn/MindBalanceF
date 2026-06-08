import * as dashboardService from '../services/dashboardService.js'

export async function getDashboard(request, response, next) {
  try {
    const insights = await dashboardService.getDashboardInsights(request.user.id)
    return response.json(insights)
  } catch (error) {
    return next(error)
  }
}
