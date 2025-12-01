<script setup lang="ts">

import { ref, watch } from "vue";
import { useMainStore } from "@/stores/mainStore.ts";
import { useGeoSearchStore } from "@/stores/geoSearchStore.ts";
import { useMapStore } from "@/stores/mapStore.ts";


const searchString = ref('');


const jumpToLocation = (e: any) => {
  useMapStore().goToLocation(e.value.coordinates, 15, true);
}


watch(searchString, (e) => {
  if (e == null) return;
  if (e.length > 1) {
    useGeoSearchStore().geoSearchLoading = true;
    useGeoSearchStore().getSearchResult(e);
  }
})
</script>


<template>

  <div id="geoSearchDialogue" class="shadow-2 flex justify-content-between" style="border-radius:6px;padding-top:4px;">

    <div class="flex card-container">

      <div class="flex align-items-start justify-content-center font-bold text-gray-900 border-round my-3">

        <div class="flex align-items-start">
          <span class="inline-flex border-circle justify-content-center align-items-center text-white"
                style="width:38px;height:38px;background-color:#0099cf;margin-bottom:2px;">
            <img alt="logo" src="@/assets/icons/icon-explore.svg"/>
          </span>
          <div style="margin-right:30px;" class="ml-4 mt-1 md:flex-order-0">
            <div class="text-white font-bold mb-1">GeoSearch</div>
            <span class="text-bluegray-200 text-sm">Enter a location</span>
          </div>
        </div>
      </div>
      <div class="lg:flex mr-2">

        <div class="flex align-items-start justify-content-start font-bold text-gray-900 border-round mt-2 mb-3 mr-4" >
          <div class="card flex ">
            <div>
              <ProgressBar v-if="useGeoSearchStore().geoSearchLoading"
                              mode="indeterminate"
                              style="marginLeft:1px;width:330px;height:4px;backgroundColor:#00aaff;">
              </ProgressBar>
              <div v-else style="marginLeft:1px;width:330px;height:4px;backgroundColor:#2b2b2b;"></div>
              <div class="p-inputgroup mb-1">
                <span class="p-inputgroup-addon py-2"> <i class="pi pi-times" @click="searchString = ''"></i></span>
                <AutoComplete v-model="searchString" optionLabel="location" :suggestions="useGeoSearchStore().searchResult"
                              force-selection :virtualScrollerOptions="{ itemSize: 30 }" @item-select="jumpToLocation">
                </AutoComplete>
              </div>
            </div>
          </div>
        </div>
      </div>

      <i class="pi pi-times mt-3" style="color:white;" @click="useMainStore().geoSearchDialogueVisible = false"></i>
    </div>

  </div>

</template>


<style scoped>

#geoSearchDialogue {
  position: absolute;
  top: 60px;
  left: calc(100vw / 2 - 330px );
  z-index: 1 !important;
  width: 650px;
  background: linear-gradient(90deg, #1a2226 70%, #384449 100%);;
  border-radius: 0 0 10px 10px !important;
  padding-left: 4rem !important;
  padding-right: 1rem !important;
}

.pi.pi-times:hover {
  cursor: pointer;
}
</style>


<style>
.p-autocomplete-empty-message {
  margin-left: 15px;
  margin-top: 10px;
}

.p-autocomplete.p-component.p-inputwrapper.p-inputwrapper-filled > .p-autocomplete-loader.p-icon.p-icon-spin {
  display: none !important;
}

.p-autocomplete.p-component.p-inputwrapper > .p-autocomplete-loader.p-icon.p-icon-spin {
  display: none !important;
}

.p-autocomplete-input {
  width: 300px !important;
}

.p-virtualscroller {
  overflow-x: hidden !important;
}
</style>