// ===== src/stores/colorStore.ts =====

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ColorSettings, ColorKey } from '@/types'
import { DEFAULT_COLORS } from '@/types/colors'

export const useColorStore = defineStore('color', () => {
  // State
  const settings = ref<ColorSettings>({ ...DEFAULT_COLORS })
  const isVisible = ref(false)
  const lastSavedSettings = ref<ColorSettings>({ ...DEFAULT_COLORS })

  // Actions
  function updateColor(key: ColorKey, value: string) {
    settings.value[key] = value
  }

  function resetColors() {
    settings.value = { ...DEFAULT_COLORS }
    lastSavedSettings.value = { ...DEFAULT_COLORS }
  }


  function toggleVisibility() {
    isVisible.value = !isVisible.value
  }

  function showSettings() {
    isVisible.value = true
  }

  function hideSettings() {
    isVisible.value = false
  }

  function exportSettings(): string {
    return JSON.stringify(settings.value, null, 2)
  }

  function importSettings(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as Partial<ColorSettings>

      // Validate imported data
      const validKeys: ColorKey[] = [
        'color1',
        'color2',
        'color3',
        'color4',
        'colorMine',
        'colorUnrevealed',
        'colorEmpty',
      ]

      const isValid = validKeys.every((key) => key in imported && typeof imported[key] === 'string')

      if (isValid) {
        settings.value = { ...settings.value, ...(imported as ColorSettings) }
        return true
      }

      return false
    } catch {
      return false
    }
  }

  function saveSettings() {
    lastSavedSettings.value = { ...settings.value }
  }

  function hasUnsavedChanges(): boolean {
    return JSON.stringify(settings.value) !== JSON.stringify(lastSavedSettings.value)
  }

  function downloadColorFile() {
    const dataStr = exportSettings()
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'minesweeper-colors.json'
    link.click()

    URL.revokeObjectURL(url)
  }

  function loadColorFile(): Promise<boolean> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            const success = importSettings(result)
            resolve(success)
          }
          reader.readAsText(file)
        } else {
          resolve(false)
        }
      }

      input.click()
    })
  }

  return {
    // State
    settings,
    isVisible,
    lastSavedSettings,
    // Actions
    updateColor,
    resetColors,
    toggleVisibility,
    showSettings,
    hideSettings,
    exportSettings,
    importSettings,
    saveSettings,
    hasUnsavedChanges,
    downloadColorFile,
    loadColorFile,
  }
})
