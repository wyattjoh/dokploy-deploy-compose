import * as core from '@actions/core'
import { Dokploy } from './dokploy'

export async function run(): Promise<void> {
  try {
    const url: string = core.getInput('url')

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

    const projects = await dokploy.getProjects()
    const compose = dokploy.findCompose(projects, projectId, composeId)

    core.info(`Found compose: ${compose.name} (${compose.composeId})`)

    await dokploy.redeployCompose(compose.composeId)

    core.info(`Successfully triggered redeploy for ${compose.name}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
