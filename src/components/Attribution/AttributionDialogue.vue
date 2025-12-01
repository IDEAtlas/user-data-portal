<script setup lang="ts">

import { useMapStore } from "@/stores/mapStore";
import { useBaseLayerStore } from "@/stores/baseLayerStore.ts";

</script>


<template>
  <div>
    <!--  Dialogue for BaseLayer Attributions  -->
    <Dialog
        id="attributionDialogue"
        v-if="useBaseLayerStore().getActiveBaseMap()"
        modal
        v-model:visible="useMapStore().showAttributionDialogue"
        :header="useBaseLayerStore().getActiveBaseMap().headerName"
        :style="{ 'width': '500px' }">
      <div class="flex-row mt-1 mb-5 line-height-3"
           v-html="useBaseLayerStore().getActiveBaseMap().attribution">
      </div>
    </Dialog>
  </div>
</template>


<style>
a {
  color: #fcfcfc;
}

#attributionDialogue .p-dialog-header {
  padding-left: 30px !important;
}

#attributionDialogue .p-dialog-content {
  padding-left: 30px !important;
}

#attributionDialogue .p-dialog-header-icon {
  margin-bottom: 15px !important;
}
</style>