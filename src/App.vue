<template>
  <div id="app">
    <canvas ref="canvas" class="canvas"></canvas>
    <div
      class="no-select"
      style="
        width: 100px;
        height: 100px;
        text-align: left;
        font-size: 8px;
        position: absolute;
        color: white;
      "
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GameInitializer } from '@/canvas/GameInitializer'

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const startGameApp = async () => {
    if (canvas.value) {
      console.log('new version!!! 2')
      new GameInitializer(canvas.value)
    }
  }
  startGameApp()
})
</script>

<style>
body {
  background-color: #1c1c1c;
  height: auto;
  min-height: 100vh;
  overflow: hidden;

  .canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
}
</style>
