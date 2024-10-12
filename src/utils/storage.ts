/// <reference types="chrome"/>

export interface Configuration {
  private_key: string
  client_email: string
}

export const saveConfiguration = async (name: string, config: Configuration, oldName: string | null = null) => {
  const configurations = await getConfigurations()
  if (oldName) {
    // If we're updating an existing configuration
    if (oldName !== name && configurations.includes(name)) {
      throw new Error('Configuration name already exists')
    }
    await chrome.storage.local.remove(oldName)
    const index = configurations.indexOf(oldName)
    if (index > -1) {
      configurations[index] = name
    }
  } else {
    // If we're adding a new configuration
    if (configurations.includes(name)) {
      throw new Error('Configuration name already exists')
    }
    configurations.push(name)
  }
  await chrome.storage.local.set({ [name]: config })
  await chrome.storage.local.set({ configurations })
}

export const deleteConfiguration = async (name: string) => {
  const configurations = await getConfigurations()
  const index = configurations.indexOf(name)
  if (index > -1) {
    configurations.splice(index, 1)
    await chrome.storage.local.remove(name)
    await chrome.storage.local.set({ configurations })
  }
}

export const getConfigurations = async (): Promise<string[]> => {
  const result = await chrome.storage.local.get('configurations')
  return result.configurations || []
}

export const getSelectedConfiguration = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get('selectedConfiguration')
  return result.selectedConfiguration || null
}

export const setSelectedConfiguration = async (name: string) => {
  await chrome.storage.local.set({ selectedConfiguration: name })
}

export const getConfiguration = async (name: string): Promise<Configuration | null> => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const result = await chrome.storage.local.get(name)
    return result[name] || null
  } else {
    // 用于测试环境
    const mockStorage = (global as any).chrome?.storage?.local;
    if (mockStorage) {
      const result = await mockStorage.get(name);
      return result[name] || null;
    }
    return null;
  }
}

export const setLastSelectedConfiguration = async (name: string) => {
  await chrome.storage.local.set({ lastSelectedConfiguration: name })
}

export const getLastSelectedConfiguration = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get('lastSelectedConfiguration')
  return result.lastSelectedConfiguration || null
}

export const setLastInputUrls = async (urls: string) => {
  await chrome.storage.local.set({ lastInputUrls: urls })
}

export const getLastInputUrls = async (): Promise<string> => {
  const result = await chrome.storage.local.get('lastInputUrls')
  return result.lastInputUrls || ''
}