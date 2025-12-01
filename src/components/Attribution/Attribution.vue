<script setup lang="ts">

import { useBaseLayerStore } from '@/stores/baseLayerStore';
import { useMapStore } from '@/stores/mapStore';


const launchAttributionDialogue = () => {
  useMapStore().showAttributionDialogue = true;
}
</script>


<template>
  <!--  basemap attribution flags  -->
  <div class="attribution p-inputgroup">
    <Button icon="pi pi-user-edit"
            class="bg-black-alpha-20 text-white-alpha-80 hover:bg-black-alpha-60 hover:text-white px-2 "
            v-tooltip.left="{ value: 'Attribution', showDelay: 1000 }"
            :showDialogue="true"
            @click="launchAttributionDialogue()"
            @close="useMapStore().showAttributionDialogue = false">
    </Button>
    <span class="p-inputgroup-addon px-2 py-3">{{ useBaseLayerStore().getActiveBaseMap()?.headerName }}</span>
  </div>
</template>


<style scoped>
.attribution {
  font-size: 9pt;
  max-width: 550px;
  position: absolute;
  right: 0;
  bottom: 72px;
  height: 22px;
  justify-content: end;
  z-index: 2;
}

.p-inputgroup-addon {
  background-color: rgba(214, 216, 217, 0.4);
  color: #212121;
  border-radius: 0 !important;
  justify-content: center;
  border: 0;
  padding-top: 0.8rem !important;
  padding-bottom: 0.8rem !important;
}

.p-inputgroup-addon:last-child {
  border-right: 0
}

.p-button.p-button-icon-only {
  width: 2rem;
  padding-top: 0.8rem !important;
  padding-bottom: 0.8rem !important;
}

@-moz-document url-prefix() {
  .p-inputgroup-addon {
    padding-bottom: 5px !important;
  }
}
</style>