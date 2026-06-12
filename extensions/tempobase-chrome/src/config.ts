export const API_BASE_URL = 'https://tempobase.pmr.dev';

export const API_ROUTES = {
  me: `${API_BASE_URL}/api/users/me`,
  projects: `${API_BASE_URL}/api/projects`,
  running: `${API_BASE_URL}/api/time-entries/running`,
  start: `${API_BASE_URL}/api/time-entries/start`,
  stop: `${API_BASE_URL}/api/time-entries/stop`,
  entries: `${API_BASE_URL}/api/time-entries`,
} as const;
