<template>
  <transition>
    <div id="layer-menu" class="surface-card px-4 py-2 prevent-select">
      <ul class="list-none p-0 m-0">
        <li v-for="(value, key) in useBaseLayerStore().baseLayers" :key="key"
            :class="{ 'border-bottom-1 surface-border': key != useBaseLayerStore().baseLayers.length - 1 }"
            class="py-1 flex flex-row md:align-items-center md:justify-content-between">
          <div class="inline-flex align-items-center flex-1 active"
               @click="setBaseLayer(value.name)">
            <img :src="getImgUrl(value.imgPath)" class="rounded-circle basemap-icon mr-3"
                 alt=""
                 :class="{ 'basemap-icon-active': value.visible }" />
            <span :class="{ 'basemap-active': value.visible }" class="text-600 basemap-header">{{ value.headerName }}</span>
          </div>
        </li>
      </ul>
    </div>
  </transition>
</template>


<script setup lang="ts">
import { useBaseLayerStore } from '@/stores/baseLayerStore.ts';
import { useMapStore } from '@/stores/mapStore.ts';
import { onMounted } from "vue";


onMounted(() => {
  useBaseLayerStore().fetchBaseLayers();
});


const setBaseLayer = (layerName: string) => {
  useBaseLayerStore().baseLayers.find(layer => {
    return layer.name === layerName;
  })
  useMapStore().setBaseLayerVisibility(layerName)

}


const getImgUrl: any = (imgPath: string) => {
  let path = '/thumbnails/' + imgPath;
  return new URL(path, import.meta.url);
}
</script>


<style scoped>
#layer-menu {
  width: 280px;
  position: absolute;
  display: block;
  z-index: 1;
  right: 10px;
  top: 110px;
  border-radius: 8px;
}

#layer-menu .p-card-content {
  padding-top: 0;
  padding-bottom: 0;
}

.basemap-icon {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 3px solid #656464;
  margin: 4px;
}

.basemap-icon-active {
  border: 3px solid #39adf6;
}

.basemap-icon:hover {
  border: 3px solid #dedddd;
}

.basemap-active {
  color: white !important;
  font-weight: bolder !important;
}

.rounded-circle {
  border-radius: 50% !important;
}

.basemap-header {
  font-size: 13px !important;
  text-transform: uppercase;
}

.active:hover {
  background-color: rgba(130, 130, 130, 0.2);
  border-radius: 4px;
  cursor: pointer;
}
</style>

