import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MinesweeperGrid from '@/components/grid/MinesweeperGrid.vue'
import { useGameStore } from '@/stores/gameStore'

describe('MinesweeperGrid brush slider', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('sets a cell directly from the slider value without cycling', async () => {
    const gameStore = useGameStore()
    gameStore.setBoardSize(5, 5)
    const wrapper = mount(MinesweeperGrid)

    const slider = wrapper.find<HTMLInputElement>('[data-testid="cell-brush-slider"]')
    expect(slider.exists()).toBe(true)

    // Select value "4" (index 5 in ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', 'M', 'F'])
    await slider.setValue('5')

    const cells = wrapper.findAll('.cell')
    await cells[0].trigger('pointerdown', { button: 0 })

    expect(gameStore.getCellValue(0, 0)).toBe('4')
  })

  it('paints multiple cells when dragging across the grid', async () => {
    const gameStore = useGameStore()
    gameStore.setBoardSize(5, 5)
    const wrapper = mount(MinesweeperGrid)

    // Click quick pill for Mine ('M')
    const minePill = wrapper.find('[data-testid="brush-pill-M"]')
    expect(minePill.exists()).toBe(true)
    await minePill.trigger('click')

    const cells = wrapper.findAll('.cell')
    await cells[0].trigger('pointerdown', { button: 0 })
    await cells[1].trigger('pointerenter')
    await cells[2].trigger('pointerenter')
    window.dispatchEvent(new Event('pointerup'))

    expect(gameStore.getCellValue(0, 0)).toBe('M')
    expect(gameStore.getCellValue(0, 1)).toBe('M')
    expect(gameStore.getCellValue(0, 2)).toBe('M')
  })
})

