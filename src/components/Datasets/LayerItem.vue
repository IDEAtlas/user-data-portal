<template>
  <div class="surface-100 shadow-4 border-round-md mb-2 layer-card no-select">
    <div class="flex align-items-center justify-content-between">
      <div class="flex w-9 layer-item">
        <span class="text-base mr-2 my-2 card-title text-white-alpha-40"
              :class="{ 'text-custom-white': itemData.visible }">
           {{ itemData.headerName }}
        </span>
        <i v-if="itemData.name.includes('prediction') && itemData.visible" class="pi pi-question-circle mt-2 ml-2 text-gray-200"
           v-tooltip.top="'PREDICTION - AI model output that requires improvements'"></i>
        <i v-if="itemData.name.includes('reference') && itemData.visible" class="pi pi-question-circle mt-2 ml-2 text-gray-200 layer-item"
           v-tooltip.top="'REFERENCE - used to assess the accuracy of the model but might have mistakes'"></i>
        <i v-if="itemData.name.includes('prediction') && !itemData.visible" class="pi pi-question-circle mt-2 ml-2 text-gray-400 layer-item"
           v-tooltip.top="'PREDICTION - AI model output that requires improvements'"></i>
        <i v-if="itemData.name.includes('reference') && !itemData.visible" class="pi pi-question-circle mt-2 ml-2 text-gray-400 layer-item"
           v-tooltip.top="'REFERENCE - used to assess the accuracy of the model but might have mistakes'"></i>
      </div>

      <div class="flex justify-content-end gap-2">
        <Button v-if="itemData.name.includes('100m')"
                :class="itemData.visible ? 'btn-visible' : 'btn-invisible'"
                class="w-2rem"
                icon="pi pi-download"
                text rounded aria-label="Download"
                @click="downloadGeoTIFF(itemData.name)" />
        <Button v-if="itemData.name.includes('evaluation')"
                :class="itemData.visible ? 'btn-visible' : 'btn-invisible'"
                class="w-2rem"
                icon="pi pi-download"
                text rounded aria-label="Download"
                @click="downloadEvaluationLayer()" />
        <Button :class="itemData.visible ? 'btn-visible' : 'btn-invisible'"
                class="w-2rem"
                icon="pi pi-eye"
                text rounded aria-label="Set Invisible"
                @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)" />
      </div>
    </div>
    <div class="grid">

      <!--  city boundary  -->
      <div class="col-2 mt-2 ml-2 py-0 px-3 legend-line" v-if="itemData.legendType === 'line' && itemData.visible"
           :style="{ background: itemData.legend }"
           @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)">
      </div>
      <div class="col-2 mt-2 ml-2 py-0 px-3 legend-line" v-if="itemData.legendType === 'line' && !itemData.visible"
           :style="{ background: 'grey' }"
           @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)">
      </div>

      <!--  ideatlas evaluation  -->
      <div class="col-2 py-0 px-0" v-if="itemData.legendType === 'image' && itemData.visible"
           @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)">
        <img src="@/assets/images/evaluation-legend.png" width="160" style="margin-left:-8px;" alt="evaluation legend">
      </div>
      <div class="col-2 py-0 px-0" v-if="itemData.legendType === 'image' && !itemData.visible"
           @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)">
        <img src="@/assets/images/evaluation-legend-inactive.png" width="160" style="margin-left:-8px;" alt="evaluation legend inactive">
      </div>

      <!--  classifications  -->
      <div class="col-2 mt-1" v-if="itemData.legendType === 'polygon' && itemData.visible"
           @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)">
        <span class="legend-polygon" :style="{ background: itemData.legend }"></span>
      </div>
      <div class="col-2 mt-1" v-if="itemData.legendType === 'polygon' && !itemData.visible"
           @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)">
        <span class="legend-polygon" :style="{ background: 'grey' }"></span>
      </div>
      <!--  description  -->
      <div v-if="!itemData.name.includes('ssi')" class="col-10 mt-1 text-sm text-500 text-white-alpha-40 pl-0"
           :class="{ 'text-custom-white' : itemData.visible }"
           @click="useMapStore().toggleDatasetLayerVisibility(itemData.name)">
        {{ itemData.description }}
      </div>

      <!--  SSI Legend  -->
      <div v-if="itemData.legendType === 'ssi_image' && itemData.visible" class="ml-1 mr-3 my-2" >
        <div class="card-content-header flex w-full text-sm text-600 justify-content-between my-1 "><span>0 %</span><span>50 %</span><span>100 %</span></div>
        <img src="/IDEAtlas_SSI_legend.png" alt="IDEAtlas SSI Legend" style="max-width: 100%; height:13px;"/>
      </div>

      <!-- Year slider -->
      <section v-if="useMainStore().isMainCity && itemData.slugName.includes('prediction') && itemData.visible" class="w-full mt-3 mb-3 ml-2 mr-4">
        <div class="grid mr-0">
          <div class="col text-600 card-content-header text-base">Select year</div>
          <div class="col text-right text-600 card-content-header pr-0 mr-1 text-sm">{{ useMainStore().currentPredictionYear }}</div>
        </div>
        <Slider class="mt-2" v-model="useMainStore().currentPredictionYear"
                :min=2019 :max=2024 :step="1"
                @slideend="useMapStore().changePredictionReferenceSource(useFeatureStore().label)"
                style="height: 3px"/>

      </section>

      <!-- Opacity slider -->
      <section v-if="(itemData.slugName == 'reference' || itemData.slugName.includes('prediction') || itemData.slugName.includes('ssi')) &&
      itemData.visible" class="w-full mt-3 mb-3 ml-2 mr-4">
        <div class="grid mr-0">
          <div class="col text-600 card-content-header text-sm">Layer opacity</div>
          <div class="col text-right text-600 card-content-header pr-0 mr-1 text-sm">{{ itemData.opacity }}&nbsp;&#37;</div>
        </div>
        <Slider class="mt-2" v-model="itemData.opacity" @change="useMapStore().changeLayerOpacity(itemData.slugName, itemData.opacity)" style="height: 3px"/>
      </section>
    </div>
  </div>
</template>


<script setup lang="ts">

import { PropType } from 'vue';
import type Layer from '@/types/Layer.ts';
import { useMainStore } from '@/stores/mainStore.ts';
import { useMapStore } from '@/stores/mapStore.ts';
import { useFeatureStore } from "@/stores/featureStore.ts";
import _ from 'lodash';
import axios from "axios";
import { useToast } from "primevue/usetoast";
import { GeoJSON } from "ol/format";

const toast = useToast();


defineProps({
  itemData: {type: Object as PropType<Layer>, required: true},
});


const downloadGeoTIFF = async (name: string) => {
  try {
    toast.add({ severity: 'success', summary: 'Downloading GeoTIFF', detail: 'Please look in your download folder', life: 3000 });
    let layerName = _.join([useFeatureStore().label, useMainStore().currentPredictionYear, name], '_');
    if (name.includes('ssi')) {
      layerName = _.join([useFeatureStore().label, name], '_');
    }

    const fileUrl = `https://portal.ideatlas.eu/geoserver/ideatlas/wcs?service=WCS&version=2.0.1&request=GetCoverage
                    &coverageId=ideatlas:${layerName}&outputCRS=EPSG:3857&format=image/tiff&geotiff:compression=Deflate`;

    let fileName = `DUA_${layerName}.tif`;
    if (name.includes('ssi')) {
      fileName = `UDI_${layerName}.tif`;
    }

    const response = await axios.get(fileUrl, {
      responseType: "blob"
    });

    const blob = new Blob([response.data], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error downloading the file:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: `An error occurred when downloading the GeoTIFF`, life: 3000 });
  }
};


const downloadEvaluationLayer = async () => {
  try {
    toast.add({ severity: 'success', summary: 'Downloading IDEAtlas evaluation layer', detail: 'Please look in your download folder', life: 3000 });

    const map = useMapStore().map;
    const layer = map.getLayers().getArray().find((l: any) => l.getClassName() === 'IDEAtlas_evaluation');

    if (!layer) {
      throw new Error("IDEAtlas evaluation layer not found");
    }

    // @ts-ignore
    const source = layer.getSource();
    const features = source.getFeatures();
    const format = new GeoJSON({ featureProjection: 'EPSG:3857' });
    const geoJSONData = format.writeFeatures(features);

    const blob = new Blob([geoJSONData], { type: "application/geo+json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = 'IDEAtlas_evaluation.geojson';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error downloading the file:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: `An error occurred when downloading the IDEAtlas evaluation layer`, life: 3000 });
  }
};
</script>


<style scoped>
.card-title {
  text-transform: uppercase;
  font-size: 13px !important;
}

.layer-card {
  padding: 2px 8px 10px 16px !important;
}

.layer-card:hover {
  cursor: pointer;
}

.btn-visible {
  color: rgba(255, 255, 255, 0.9) !important;
}

.btn-invisible {
  color: rgba(255, 255, 255, 0.4) !important;
}

.text-custom-white {
  color: rgba(255, 255, 255, 0.9) !important;
}

.legend-polygon {
  padding: 1px 13px;
  background: white;
}

.legend-line {
  width: 40px;
  height: 4px;
  background: white;
}

.p-slider {
  background-color: rgba(16, 15, 15, 0.3);
}
</style>

<style>
span.p-slider-range {
  background-color: rgba(255,255,255,0.3) !important;
}

.p-tooltip-text {
  color: #2faef3 !important;
}
</style>
