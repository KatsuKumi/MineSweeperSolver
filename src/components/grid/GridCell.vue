<template>
  <div
    :class="cellClasses"
    @pointerdown="$emit('pointerdown', $event)"
    @pointerenter="$emit('pointerenter', $event)"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    {{ displayValue }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BoardCell } from '@/types/board'

interface Props {
  cell: BoardCell
  isHighlighted?: boolean
  highlightType?: 'safe' | 'mine'
}

const props = defineProps<Props>()
defineEmits<{
  pointerdown: [event: PointerEvent]
  pointerenter: [event: PointerEvent]
  contextmenu: [event: MouseEvent]
}>()

const cellClasses = computed(() => [
  'cell',
  props.cell.value && /^[1-8]$/.test(props.cell.value) ? `number-${props.cell.value}` : '',
  {
    unrevealed: props.cell.value === '',
    'empty-revealed': props.cell.value === '0',
    number: /^[1-8]$/.test(props.cell.value),
    mine: props.cell.value === 'M',
    flag: props.cell.value === 'F',
    'safe-move': props.isHighlighted && props.highlightType === 'safe',
    'mine-move': props.isHighlighted && props.highlightType === 'mine',
  },
])

const displayValue = computed(() => {
  if (props.cell.value === 'M') return '💣'
  if (props.cell.value === 'F') return '🚩'
  if (props.cell.value === '0' || props.cell.value === '') return ''
  return props.cell.value
})
</script>
