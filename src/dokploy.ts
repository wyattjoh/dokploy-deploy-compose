import { fetch } from 'undici'

export interface Compose {
  composeId: string
  name: string
  appName: string
}

export interface Environment {
  environmentId: string
  name: string
  compose: Compose[]
}

export interface Project {
  projectId: string
  name: string
  environments: Environment[]
}

export class Dokploy {
  constructor(
    private readonly url: string,
    private readonly token: string
  ) {}

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${this.url}/api/project.all`, {
      headers: {
        'x-api-key': this.token,
        Accept: 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${await response.text()}`)
    }

    return (await response.json()) as Project[]
  }

  findCompose(projects: Project[], projectId: string, composeId: string): Compose {
    const project = projects.find(p => p.projectId === projectId)
    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }

    for (const env of project.environments) {
      const compose = env.compose?.find(c => c.composeId === composeId)
      if (compose) return compose
    }

    throw new Error(`Compose ${composeId} not found in project ${project.name}`)
  }

  async redeployCompose(composeId: string): Promise<void> {
    const response = await fetch(`${this.url}/api/compose.redeploy`, {
      method: 'POST',
      headers: {
        'x-api-key': this.token,
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
