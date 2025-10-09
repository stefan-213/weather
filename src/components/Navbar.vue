<template>
  <div class="navbar" ref="navbarRef">
    <div class="logo" v-if="theme == 'light'" >
      <img src="../assets/img/light-icon.svg" alt="">
    </div>
    <div class="logo" v-else >
      <img src="../assets/img/dark-icon.svg" alt="">
    </div>
    <div class="title">
      WeatherInsight
    </div>
    <div class="select">
      <Select></Select>
    </div>
    <div class="search">
      <Search></Search>
    </div>
    <div class="theme">
      <Theme></Theme>
    </div>
  </div>
</template>

<script setup>
import Theme from './button/Theme.vue';
import Search from './Search.vue';
import Select from './button/Select.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const navbarRef = ref(null);
let lastScrollTop = 0;
const theme = ref('light');

// 监听主题变更事件
const handleThemeChange = (event) => {
  theme.value = event.detail.theme;
};

// 页面加载完成后显示导航栏
onMounted(() => {

// 添加主题变更事件监听器
  window.addEventListener('theme-change', handleThemeChange);

  // 添加初始显示延迟
  setTimeout(() => {
    if (navbarRef.value) {
      navbarRef.value.classList.add('visible');
    }
  }, 300);
  
  // 添加滚动事件监听器
  window.addEventListener('scroll', handleScroll);
});

// 滚动事件处理函数
const handleScroll = () => {
  if (!navbarRef.value) return;
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // 向下滚动，隐藏导航栏
    navbarRef.value.classList.remove('visible');
  } else {
    // 向上滚动，显示导航栏
    navbarRef.value.classList.add('visible');
  }
  
  lastScrollTop = scrollTop;
};

// 清理事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('theme-change', handleThemeChange);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* 导航栏样式 */
.navbar {
  display: flex;
  align-items: center;
  color: var(--text-title-color);
  font-size: 20px;
  font-weight: 600;
  height: 80px;
  width: 100%;
  background-color: var(--card-bg);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: -100px; /* 初始位置在视口上方 */
  left: 0;
  z-index: 1000;
  transition: top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 导航栏显示时的状态 */
.navbar.visible {
  top: 0;
}

.logo {
  margin-left: 10%;
}

.title {
  margin-left: 16px;
}

.select {
  margin-left: 36px;
}

.select #select {
  width: 80px;
  border: none;
  background-color: var(--bg-color);
  color: var(--text-title-color);
  font-size: 20px;
  font-weight: 600;
}

.search {
  margin-left: 16px;
}

.theme {
  margin-right: 4em;
  margin-left: auto;
}
</style>