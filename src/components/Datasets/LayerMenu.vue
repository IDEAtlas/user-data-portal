<template>
  <transition>
    <div id="layer-menu" class="surface-card px-4 py-2 prevent-select">
      <ul class="list-none p-0 m-0 pt-2">
        <LayerItem v-for="(item, key) in useDatasetLayerStore().datasetLayers" :itemData="item" :key="key"/>
      </ul>
    </div>
  </transition>
</template>


<script setup lang="ts">
import LayerItem from './LayerItem.vue'
import { onMounted } from "vue";
import { useDatasetLayerStore } from '@/stores/datasetLayerStore.ts';
import { useKeycloak } from "@/components/Authentication/keycloak.ts";

const { isAuthenticated } = useKeycloak();


onMounted(() => {
  if (isAuthenticated.value) {
    useDatasetLayerStore().getAuthorizedDatasets();
  } else {
    useDatasetLayerStore().getUnauthorizedDatasets();
  }
})

</script>


<style scoped>
* {
  font-size: 10px;
}
</style>

<style>
#layer-menu {
  width: 280px;
  max-height: 75vh;
  position: absolute;
  display: block;
  z-index: 1;
  right: 10px;
  top: 110px;
  border-radius: 8px;
  overflow-y: auto;
}

#layer-menu {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
