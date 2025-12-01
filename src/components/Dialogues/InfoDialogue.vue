<script setup lang="ts">
import { useMainStore } from "@/stores/mainStore.ts";

</script>


<template>
  <Dialog v-model:visible="useMainStore().infoDialogueVisible" :modal="true" :closable="true" :showHeader="true" header="About IDEAtlas Portal"
          :breakpoints="{ '1199px': '80vw', '575px': '80vw' }" :position="'top'" :style="{width: '40vw'}" id="infoPage">
    <div class="bg-white-alpha-50"></div>
    <div class="line-height-2 p-0 m-0 mr-5 text-700" style="font-size: 15px">
      <p class="text-justify text-700">We ask you to help us improve the reference and prediction layers. Both layers might have mistakes or are not sufficiently updated. This will help us to rerun the model to improve our prediction (AI mapping results).</p>
      <p>Find further information here: <a href="https://ideatlas.eu" target="_blank" class="text-yellow-600">https://ideatlas.eu</a></p>
      <div class="">
        <p class="my-6">The term “informal settlement” builds on the UN-Habitat SDG indicator definition. It relates to an area deprived of service, infrastructure, housing durability, location and tenure security.</p>
        <p>To help us to improve layers, please do the following:</p>
        <ol>
          <li class="mb-2">Check an area you are very familiar with and draw a polygon of the size of a city block. Select (classes) whether the area is informal or formal.</li>
          <li class="mb-2">Check areas where the prediction and the reference disagree and also draw the size of the area of disagreement or larger (e.g., the size of a city block).</li>
          <li class="mb-2">Check further areas of disagreement you know and add polygons.</li>
        </ol>
      </div>
      <div class="mt-6">
        <a href="/readme.txt" target="_blank" rel="noopener noreferrer">View Metadata</a>
      </div>
    </div>
    <template #footer>
      <div class="border-top-1 surface-border pt-3 flex justify-content-end">
        <Button label="Close" class="p-button-outlined text-yellow-600 mr-2 px-4 py-2 font-bold" @click="useMainStore().infoDialogueVisible = false"></Button>
      </div>
    </template>
  </Dialog>
</template>


<style scoped>
* {
  font-size: 13px;
}
</style>
