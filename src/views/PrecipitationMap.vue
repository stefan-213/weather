<template>
    <div class="precipitation-page">
        <div class="page-content">
            <h1 class="page-title">数据可视化</h1>
            <p class="page-desc">降水地图等功能开发中...</p>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.precipitation-page {
    width: 100%;
    min-height: calc(100vh - 80px);
    padding-top: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-color);
}

.page-content {
    text-align: center;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 12px;
}

.page-desc {
    font-size: 14px;
    color: var(--text-color);
    opacity: 0.6;
}
</style>
