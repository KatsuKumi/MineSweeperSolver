// ===== src/stores/analysisStore.ts =====

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DetectedBoard, AnalysisResult, ColorDebugInfo } from '@/types'

export const useAnalysisStore = defineStore('analysis', () => {
  // State
  const uploadedImage = ref<HTMLImageElement | null>(null)
  const isAnalyzing = ref(false)
  const lastResult = ref<AnalysisResult | null>(null)
  const debugInfo = ref<ColorDebugInfo[]>([])
  const statusMessage = ref('')

  // Getters
  const hasImage = computed(() => uploadedImage.value !== null)
  const hasResult = computed(() => lastResult.value !== null)
  const isSuccessful = computed(() => lastResult.value?.success === true)

  // Actions
  function setUploadedImage(image: HTMLImageElement) {
    uploadedImage.value = image
    clearResults()
  }

  function clearImage() {
    uploadedImage.value = null
    clearResults()
  }

  function clearResults() {
    lastResult.value = null
    debugInfo.value = []
    statusMessage.value = ''
  }

  function setAnalyzing(analyzing: boolean) {
    isAnalyzing.value = analyzing
  }

  function setResult(result: AnalysisResult) {
    lastResult.value = result
    isAnalyzing.value = false

    if (result.success) {
      statusMessage.value = `Analysis complete! Found ${result.board?.mines} mines, ${result.board?.numbers} numbers`
    } else {
      statusMessage.value = result.error || 'Analysis failed'
    }
  }

  function setDebugInfo(info: ColorDebugInfo[]) {
    debugInfo.value = info
  }

  function setStatusMessage(message: string) {
    statusMessage.value = message
  }

  function getDetectedBoard(): DetectedBoard | null {
    return lastResult.value?.board || null
  }

  function handleImageUpload(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        setStatusMessage('Please upload a valid image file')
        reject(new Error('Invalid file type'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setUploadedImage(img)
          setStatusMessage(`Image uploaded: ${img.width}×${img.height}px`)
          resolve()
        }
        img.onerror = () => {
          setStatusMessage('Failed to load image')
          reject(new Error('Failed to load image'))
        }
        img.src = e.target?.result as string
      }
      reader.onerror = () => {
        setStatusMessage('Failed to read file')
        reject(new Error('Failed to read file'))
      }
      reader.readAsDataURL(file)
    })
  }

  function reset() {
    clearImage()
    isAnalyzing.value = false
  }

  return {
    // State
    uploadedImage,
    isAnalyzing,
    lastResult,
    debugInfo,
    statusMessage,
    // Getters
    hasImage,
    hasResult,
    isSuccessful,
    // Actions
    setUploadedImage,
    clearImage,
    clearResults,
    setAnalyzing,
    setResult,
    setDebugInfo,
    setStatusMessage,
    getDetectedBoard,
    handleImageUpload,
    reset,
  }
})
