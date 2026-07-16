// Apify REST API v2 — minimal client
// Docs: https://docs.apify.com/api/v2

export interface ApifyUser {
  username:   string
  email:      string
  isPaidUser: boolean
  plan?:      string
}

export type ApifyRunStatus =
  | 'READY'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'TIMING-OUT'
  | 'TIMED-OUT'
  | 'ABORTING'
  | 'ABORTED'

export const TERMINAL_STATUSES: ApifyRunStatus[] = [
  'SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED',
]

export interface ApifyRun {
  id:               string
  actId:            string
  status:           ApifyRunStatus
  startedAt:        string
  finishedAt?:      string
  defaultDatasetId: string
  stats?: {
    netRunDurationSecs?: number
    durationMillis?:     number
  }
}

export interface ApifyActorMeta {
  id:           string
  name:         string
  username:     string
  title?:       string
  description?: string
}

const BASE_URL = 'https://api.apify.com/v2'

export class ApifyClient {
  private readonly apiKey: string
  constructor(apiKey: string) { this.apiKey = apiKey }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const sep = path.includes('?') ? '&' : '?'
    const url = `${BASE_URL}${path}${sep}token=${encodeURIComponent(this.apiKey)}`

    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })

    if (!res.ok) {
      let message = `Apify API ${res.status}`
      try {
        const body = await res.json()
        if (body?.error?.message) message = body.error.message
      } catch { /* ignore */ }
      throw new Error(message)
    }

    const body = await res.json()
    return (body.data ?? body) as T
  }

  async getMe(): Promise<ApifyUser> {
    return this.request<ApifyUser>('/users/me')
  }

  async listUserActors(limit = 30): Promise<ApifyActorMeta[]> {
    const data = await this.request<{ items: ApifyActorMeta[] }>(`/acts?my=true&limit=${limit}`)
    return data.items ?? []
  }

  async startRun(actorId: string, input?: Record<string, unknown>): Promise<ApifyRun> {
    const encoded = encodeURIComponent(actorId)
    return this.request<ApifyRun>(`/acts/${encoded}/runs`, {
      method: 'POST',
      body: JSON.stringify(input ?? {}),
    })
  }

  async getRun(runId: string): Promise<ApifyRun> {
    return this.request<ApifyRun>(`/actor-runs/${runId}`)
  }

  async abortRun(runId: string): Promise<ApifyRun> {
    return this.request<ApifyRun>(`/actor-runs/${runId}/abort`, { method: 'POST' })
  }

  async getDatasetItems(datasetId: string, limit = 200): Promise<Record<string, unknown>[]> {
    // /items returns a plain JSON array, not { data: { items: [] } }
    const items = await this.request<Record<string, unknown>[]>(
      `/datasets/${datasetId}/items?limit=${limit}&clean=true`,
    )
    return Array.isArray(items) ? items : []
  }

  async getDatasetInfo(datasetId: string): Promise<{ itemCount: number }> {
    return this.request<{ itemCount: number }>(`/datasets/${datasetId}`)
  }
}
