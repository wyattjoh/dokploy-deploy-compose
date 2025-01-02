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

    const projectID: string = core.getInput('project-id')
    const composeID: string = core.getInput('compose-id')

    core.info(`Deploying compose ${composeID} in project ${projectID}`)

    let projects: Project[]
    try {
      projects = await dokploy.getProjects()
    } catch (error) {
      throw new Error(`Failed to get projects: ${error as Error}`)
    }

    const project = projects.find(p => p.projectId === projectID)
    if (!project) {
      throw new Error(`Project ${projectID} not found`)
    }

    const compose = project.compose.find(c => c.composeId === composeID)
    if (!compose) {
      throw new Error(`Compose ${composeID} not found`)
    }

    try {
      await dokploy.redeployCompose(composeID)
    } catch (error) {
      throw new Error(`Failed to redeploy compose: ${error as Error}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
