import * as fs from 'fs/promises'
import { join } from 'path'
import { CreatePluginConfiguration } from './create-plugin'
import { FastifyPluginAsync, HTTPMethods, RouteOptions } from 'fastify'

const httpMethodsInFileName = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
]

async function checkIsFileADirectory(path: string): Promise<boolean> {
  const fileStat = await fs.stat(path)
  return fileStat.isDirectory()
}

function parseFileName(fileName: string): { url: string; method: HTTPMethods } {
  const tokens = fileName
    .split('.')
    .filter((t) => t !== 'ts' && t !== 'js' && t !== 'cjs' && t !== 'mjs')
  if (tokens.length === 1) {
    const token = tokens[0]

    if (httpMethodsInFileName.includes(token)) {
      return {
        url: '/',
        method: token as HTTPMethods,
      }
    }

    return {
      url: token,
      method: 'GET',
    }
  }

  const [url, method] =
    tokens.length > 2
      ? [
          tokens.slice(0, tokens.length - 1).join('/'),
          tokens[tokens.length - 1],
        ]
      : tokens

  if (!httpMethodsInFileName.includes(method)) {
    throw new Error(`invalid name for ${fileName}`)
  }

  return {
    url: '/' + url.replace(/\[([a-zA-Z]+)\]/g, ':$1'),
    method: method as HTTPMethods,
  }
}

export async function autoRoute(
  path: string,
  prefix = ''
): Promise<CreatePluginConfiguration> {
  const config: CreatePluginConfiguration = {
    plugins: [],
    routes: [],
    prefix,
  }

  const files = await fs.readdir(path)
  const filteredFilePaths = files.filter(
    (relativeFilePath) =>
      !relativeFilePath.endsWith('.d.ts') &&
      !relativeFilePath.endsWith('.map') &&
      !relativeFilePath.startsWith('_') &&
      !(relativeFilePath === 'index.ts')
  )

  const filesWithResolvedPath = await Promise.all(
    filteredFilePaths.map(async (relativePath) => {
      const absolutePath = join(path, relativePath)
      const isDirectory = await checkIsFileADirectory(absolutePath)

      return [absolutePath, relativePath, isDirectory] as const
    })
  )

  await Promise.all(
    filesWithResolvedPath.map(
      async ([absolutePath, relativePath, isDirectory]) => {
        if (isDirectory) {
          const nestedPlugin = await autoRoute(absolutePath, relativePath)
          config.plugins?.push(nestedPlugin)
          return
        }

        const importedModule = await import(absolutePath)

        if (!('default' in importedModule)) {
          return
        }

        if (
          typeof importedModule.default === 'object' &&
          'identity' in importedModule.default &&
          importedModule.default.identity === 'plugin_extend'
        ) {
          config.extend = importedModule.default
            .fastifyPlugin as FastifyPluginAsync
          return
        }

        const routeOptions: RouteOptions =
          'default' in importedModule.default
            ? importedModule.default.default
            : importedModule.default

        const { url, method } = parseFileName(relativePath)

        routeOptions.url = url
        routeOptions.method = method

        config.routes?.push(routeOptions)
      }
    )
  )

  return config
}
