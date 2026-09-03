// 为开发环境的入口生成占位 index.html 文件
import { isDev, r, port, log } from './utils'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import { writeManifest } from './manifest'

// 用于开发环境中 Vite 启动的 index.html 占位文件
async function stubIndexHtml() {
  const views = ['panel']

  for (const view of views) {
    // 确保指定路径的目录存在，如果不存在则自动创建该目录及其所有父级目录
    await fs.ensureDir(r(`extension/dist/${view}`))
    let data = await fs.readFile(r(`src/${view}/index.html`), 'utf-8')
    // 将 index.html 中的 "./main.ts" 替换为开发服务器地址
    // 这样做可以通过 vite 的热更新加载入口文件
    data = data.replace(
      '"./main.ts"',
      `"http://localhost:${port}/${view}/main.ts"`,
    )
    // 生成对应的 html 文件
    await fs.writeFile(r(`extension/dist/${view}/index.html`), data, 'utf-8')
    log(
      'Vite',
      `${view}: dev server started at http://localhost:${port}/${view}/index.html`,
    )
  }
}

// 复制 public 目录下的静态资源到 extension 目录
async function copyPublicAssets() {
  try {
    // 确保 extension 目录存在
    await fs.ensureDir(r('extension'))

    const publicDir = r('public')

    // 检查 public 目录是否存在
    const publicExists = await fs.pathExists(publicDir)

    if (publicExists) {
      const files = await fs.readdir(publicDir)

      // 确保 extension/assets 目录存在
      await fs.ensureDir(r('extension/assets'))

      // 复制 public 目录下的所有文件到 extension/assets 目录
      for (const file of files) {
        const srcPath = r('public', file)
        const destPath = r('extension/assets', file)
        await fs.copy(srcPath, destPath, { overwrite: true })
      }

      log('PRE', 'copied public assets to extension directory')
    }
  } catch (error) {
    console.error('Error copying public assets:', error)
  }
}

// 复制 background 脚本到 extension/dist/background 目录
async function copyBackground() {
  try {
    await fs.ensureDir(r('extension/dist/background'))
    await fs.copy(
      r('src/background/index.js'),
      r('extension/dist/background/index.js'),
      { overwrite: true },
    )
    log('PRE', 'copied background script')
  } catch (error) {
    console.error('Error copying background script:', error)
  }
}

await Promise.all([writeManifest(), copyPublicAssets(), copyBackground()])

if (isDev) {
  stubIndexHtml()
  // 监听 html 文件变化，重新生成 index.html
  chokidar.watch(r('src/**/*.html')).on('change', () => {
    stubIndexHtml()
  })
  // 监听 manifest.ts、package.json 和 scripts/utils.ts 变化，重新生成 manifest.json
  chokidar
    .watch([r('src/manifest.ts'), r('package.json'), r('scripts/utils.ts')])
    .on('change', () => {
      writeManifest()
    })
  // 监听 public 目录变化，重新复制静态资源
  chokidar.watch(r('public/**/*')).on('change', () => {
    copyPublicAssets()
  })
  // 监听 background 脚本变化，重新复制
  chokidar.watch(r('src/background/index.js')).on('change', () => {
    copyBackground()
  })
}
