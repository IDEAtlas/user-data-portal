import { defineStore } from 'pinia';
import { ref } from "vue";


export const useMainStore = defineStore('mainStore',
  () => {
    const infoDialogueVisible = ref(false);
    const baseLayerMenuVisible = ref(false);
    const datasetMenuVisible = ref(false);
    const geoSearchDialogueVisible = ref(false);
    const editingControlVisible = ref(true);
    const statisticsDialogueVisible = ref(false);
    const cities = ref();
    const mainCityLabels = ['mexico_city', 'medellin', 'salvador', 'buenos_aires', 'lagos', 'nairobi', 'mumbai', 'jakarta'];
    const basicAuth = import.meta.env.VITE_GEOSERVER_AUTH;
    const multitemporalMaps = ref([]);
    const currentPredictionYear = ref();
    const isMainCity = ref(true);

 
  return {
    infoDialogueVisible,
    baseLayerMenuVisible,
    datasetMenuVisible,
    geoSearchDialogueVisible,
    editingControlVisible,
    statisticsDialogueVisible,
    cities,
    mainCityLabels,
    basicAuth,
    multitemporalMaps,
    currentPredictionYear,
    isMainCity
  }
})
