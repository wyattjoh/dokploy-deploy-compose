import * as core from '@actions/core'
import { Dokploy, type Project } from './dokploy'

export async function run(): Promise<void> {
  try {
    const url: string = core.getInput('url')

    // Validate that the url is a valid URL
    try {
      new URL(url)
    } catch {
      throw new Error(`Invalid URL: ${url}`)
    }

    const token: string = core.getInput('token')

    const dokploy = new Dokploy(url, token)

    const projectId: string = core.getInput('project-id')
    const composeId: string = core.getInput('compose-id')

    core.info(`Deploying compose ${composeId} in project ${projectId}`)

    let projects: Project[]
    try {
      projects = await dokploy.getProjects()
    } catch (error) {
      throw new Error(`Failed to get projects: ${error as Error}`)
    }

    const project = projects.find(p => p.projectId === projectId)
    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }

    const compose = project.compose.find(c => c.composeId === composeId)
    if (!compose) {
      throw new Error(`Compose ${composeId} not found`)
    }

    try {
      await dokploy.redeployCompose(compose.composeId)
    } catch (error) {
      throw new Error(`Failed to redeploy compose: ${error as Error}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
