<template>
  <div class="custom-select" @blur="isOpen = false" tabindex="0">
    <div class="select-header" @click="toggleSelect">
      {{ selectedOption.label }}
      <span :class="['arrow', { 'rotated': isOpen }]">▼</span>
    </div>
    <div v-show="isOpen" class="select-options">
      <div 
        v-for="option in options" 
        :key="option.value"
        class="select-option"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const selectedOption = ref({ value: '1', label: '总览' })

const options = [
  { value: '1', label: '总览' },
  { value: '2', label: '地图' }
]

// 监听路由变化，同步选中项
watch(() => route.path, (newPath) => {
  const matchedOption = options.find(option => 
    (option.value === 'home' && newPath === '/') ||
    (option.value === 'precipitation' && newPath === '/precipitation')
  )
  
  if (matchedOption) {
    selectedOption.value = matchedOption
  }
}, { immediate: true })

const toggleSelect = () => {
  isOpen.value = !isOpen.value

}

const selectOption = (option) => {
  selectedOption.value = option
  isOpen.value = false


   if (option.value === '1') {
    router.push('/')
  } else if (option.value === '2') {
    router.push('/precipitation')
  }
}
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100px;
  border-radius: 8px;
  background-color:  var(--bg-color);
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title-color);
}

.select-header {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.select-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.select-option {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background-color: var(--card-bg);
}

.select-option.selected {
  background-color: #4a90e2;
  color: var(--text-color);
}
</style>