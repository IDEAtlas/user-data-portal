<script setup lang="ts">
import { useFeatureStore } from "@/stores/featureStore.ts";
import { useMainStore } from "@/stores/mainStore.ts";

</script>


<template>
  <div id="editingControl" class="shadow-2 flex">
    <div class="flex flex-nowrap card-container">

      <!--  icon   -->
      <div class="flex-none">
        <span class="inline-flex border-circle text-white m-3"
              style="width: 28px;height:28px;background-color:#0099cf;">
          <img v-if="useFeatureStore().editingMode === 'create'" class="p-2" alt="logo" src="../../assets/icons/create-polygon.svg"/>
          <img v-if="useFeatureStore().editingMode === 'update'" class="p-2" alt="logo" src="../../assets/icons/edit-polygon.svg"/>
          <img v-if="useFeatureStore().editingMode === 'delete'" class="p-2" alt="logo" src="../../assets/icons/delete-polygon.svg"/>
          <img v-if="useFeatureStore().editingMode === 'pan'" class="p-2" alt="logo" src="../../assets/icons/icon-pan.svg"/>
        </span>
      </div>

      <!--  short description  -->
      <div v-if="useFeatureStore().editingMode === 'create'" class="w-11rem mx-3 mt-2 align-items-center">
        <div class="text-white font-bold mt-2">Create Mode</div>
        <span class="text-bluegray-200 text-sm">Create polygons and details</span>
      </div>

      <div v-if="useFeatureStore().editingMode === 'update'" class="w-11rem  mx-3 mt-2 align-items-center">
        <div class="text-white font-bold mt-2">Select & Edit Mode</div>
        <span class="text-bluegray-200 text-sm">Edit polygons and attributes</span>
      </div>

      <div v-if="useFeatureStore().editingMode === 'delete'" class="w-11rem  mx-3 mt-2 align-items-center">
        <div class="text-white font-bold mt-2">Delete Mode</div>
        <span class="text-bluegray-200 text-sm">Delete polygons</span>
      </div>

      <div v-if="useFeatureStore().editingMode === 'pan'" class="w-11rem mx-3 mt-2 align-items-center">
        <div class="text-white font-bold mt-2">Pan Mode</div>
        <span class="text-bluegray-200 text-sm">Move through the map</span>
      </div>

      <!--  long description  -->
      <div class="w-21rem mt-3 mx-4 align-items-center">
        <span class="text-bluegray-200 text-sm line-height-3">
          {{ useFeatureStore().currentCommand }}
        </span>
      </div>
      <i class="w-2rem pi pi-times mt-3 cursor-pointer" style="color:white;" @click="useMainStore().editingControlVisible = false"></i>
    </div>
  </div>
</template>


<style scoped>
#editingControl {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1 !important;
  width: 550px;
  height: 52px;
  background: linear-gradient(90deg, #1a2226 70%, #384449 100%);;
  border-radius: 10px 0 0 0 !important;
  padding-left: 2rem !important;
  padding-right: 1rem !important;
}
</style>