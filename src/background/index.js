/* global chrome */
// CodeTool 后台服务工作线程：右键菜单 + 打开工具面板窗口

const PANEL_URL = 'dist/panel/index.html'
const MENU_ID = 'open-codetool-panel'
const PANEL_WIDTH = 1040
const PANEL_HEIGHT = 720

// 记录已打开的面板窗口 id，便于复用（聚焦而非重复打开）
let panelWindowId = null

// 安装/更新时创建右键菜单（菜单会持久化，浏览器重启无需重建）
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: '打开编码工具面板',
      contexts: ['all'],
    })
  })
}

// 打开（或聚焦）工具面板窗口
async function openPanel() {
  // 若已有打开的窗口，尝试聚焦
  if (panelWindowId != null) {
    try {
      const win = await chrome.windows.get(panelWindowId)
      if (win) {
        await chrome.windows.update(panelWindowId, {
          focused: true,
          state: 'normal',
        })
        return
      }
    } catch {
      panelWindowId = null
    }
  }

  try {
    const win = await chrome.windows.create({
      url: chrome.runtime.getURL(PANEL_URL),
      type: 'popup',
      width: PANEL_WIDTH,
      height: PANEL_HEIGHT,
    })
    if (win && typeof win.id === 'number') {
      panelWindowId = win.id
    }
  } catch (err) {
    console.error('打开编码工具面板失败:', err)
  }
}

chrome.runtime.onInstalled.addListener(createContextMenus)

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === MENU_ID) {
    openPanel()
  }
})

// 点击工具栏图标也打开面板窗口（未设置 default_popup 时生效）
chrome.action.onClicked.addListener(openPanel)

// 面板窗口被关闭时清理记录
chrome.windows.onRemoved.addListener((winId) => {
  if (winId === panelWindowId) {
    panelWindowId = null
  }
})
