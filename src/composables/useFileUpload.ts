import { ref } from 'vue'
import { useAnalysisStore } from '@/stores'

export function useFileUpload() {
  const analysisStore = useAnalysisStore()
  const isDragOver = ref(false)

  function handleFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  function handleDragOver(event: DragEvent): void {
    event.preventDefault()
    isDragOver.value = true
  }

  function handleDragLeave(): void {
    isDragOver.value = false
  }

  function handleDrop(event: DragEvent): void {
    event.preventDefault()
    isDragOver.value = false

    const file = event.dataTransfer?.files[0]
    if (file) {
      uploadFile(file)
    }
  }

  async function uploadFile(file: File): Promise<void> {
    try {
      await analysisStore.handleImageUpload(file)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  function createFileInput(): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = handleFileSelect
    return input
  }

  function openFileDialog(): void {
    const input = createFileInput()
    input.click()
  }

  return {
    isDragOver,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadFile,
    openFileDialog,
  }
}
