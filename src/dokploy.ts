import { fetch } from 'undici'

export interface Project {
  projectId: string
  name: string
  compose: Compose[]
}

export interface Compose {
  composeId: string
  name: string
  appName: string
}

export class Dokploy {
  constructor(
    private readonly url: string,
    private readonly token: string
  ) {}

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${this.url}/api/project.all`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${await response.text()}`)
    }

    const data = (await response.json()) as Project[]

    return data
  }

  async redeployCompose(composeId: string): Promise<void> {
    const response = await fetch(`${this.url}/api/compose.redeploy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        composeId
      })
    })
    if (!response.ok) {
      throw new Error(`Failed to redeploy compose: ${await response.text()}`)
    }
  }
}
