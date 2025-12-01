import { defineStore } from 'pinia';
import { ref } from "vue";


export const useStatisticsStore = defineStore('statisticsStore',
  () => {
    const cityStatistics = ref();

  return {
    cityStatistics
  }
})