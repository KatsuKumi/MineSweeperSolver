<template>
  <div :class="cellClasses" @click="$emit('click')">
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
const emit = defineEmits<{
  click: []
}>()

const cellClasses = computed(() => [
  'cell',
  {
    unrevealed: props.cell.value === '',
    'empty-revealed': props.cell.value === '0',
    number: /^[1-8]$/.test(props.cell.value),
    'number--green': props.cell.value === '2',
    'number--red': props.cell.value === '3',
    mine: props.cell.value === 'M',
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

