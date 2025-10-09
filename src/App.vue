<template>
    <div class="body">
        <div class="navbar">
           <Navbar></Navbar>
        </div>
        <div class="main">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';   
</script>

<style scoped>

.body {
    width: 100%;
    height: 100%;
}
.main{
    padding-top: 40px;
}

</style>