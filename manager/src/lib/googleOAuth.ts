const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
] as const

export function isGoogleConfigured(): boolean {
  return !!CLIENT_ID && CLIENT_ID.trim() !== ''
}

export function buildGoogleOAuthUrl(): string {
  const redirectUri = `${window.location.origin}/manager/auth/google/callback`
  const params = new URLSearchParams({
    client_id: CLIENT_ID ?? '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export function parseScopeLabels(scope: string): string[] {
  const labels: string[] = []
  if (scope.includes('gmail')) labels.push('Gmail')
  if (scope.includes('calendar')) labels.push('Google Agenda')
  if (scope.includes('drive')) labels.push('Google Drive')
  if (scope.includes('spreadsheets')) labels.push('Google Sheets')
  return labels
}

export function hasSheetsScope(scope: string): boolean {
  return scope.includes('spreadsheets')
}
