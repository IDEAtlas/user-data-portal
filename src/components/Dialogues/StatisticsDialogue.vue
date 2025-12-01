<template>
  <Dialog
      v-model:visible="useMainStore().statisticsDialogueVisible"
      position="center"
      class="flex align-content-between z-1 text-xl"
      :style="{ width: '800px' }">

    <!--  customized header  -->
    <template #header>
      City Statistics for {{ useFeatureStore().city }}
    </template>

    <div v-if="dataAvailable">
      <!--  Three pie charts  -->
      <div class="flex flex-row justify-content-between align-items-start gap-4 pl-3 pr-6 py-3">

        <!--  Pie chart - proportion of area covered by DUAs  -->
        <div class="flex flex-column justify-content-center">
          <div class="text-base w-full text-center">Proportion of Area Covered by DUAs</div>
          <div class="flex p-4 mt-3">
            <Chart type="doughnut" :data="chartAreaData" :options="chartOptions" />
          </div>
        </div>

        <!--  Pie chart - Population in DUAs GHSL estimates  -->
        <div class="flex flex-column justify-content-center">
          <div class="text-base w-full text-center">Proportion of People Living in DUAs<br>GHS estimates</div>
          <div class="p-4">
            <Chart type="doughnut" :data="chartPopulationGHSData" :options="chartOptions" />
          </div>
        </div>

        <!--  Pie chart - Population in DUAs GOV estimates  -->
        <div class="flex flex-column justify-content-center align-items-start">
          <div class="text-base w-full text-center">Proportion of People Living in DUAs<br>GOV estimates</div>
          <div class="p-4">
            <Chart type="doughnut" :data="chartPopulationGOVData" :options="chartOptions" />
          </div>

          <!--  gov chart annotations  -->
          <div class="text-center" style="width:216px;">
            {{ govSource }}
          </div>
        </div>
      </div>

      <!--  chart annotations  -->
      <div v-if="notes" v-for="(item) in notes.notes">
        {{ item }}
      </div>
    </div>
    <div v-else class="w-full align-items-center justify-content-center ">
      <div class="text-base uppercase">No data available for this city</div>
    </div>
  </Dialog>
</template>


<script setup lang="ts">

import { ref, watch } from "vue";
import { useMainStore } from "@/stores/mainStore.ts";
import { useStatisticsStore } from "@/stores/statisticsStore.ts";
import { useFeatureStore } from "@/stores/featureStore.ts";
import _ from "lodash";
import Chart from "primevue/chart";


const notes = ref<{ notes: string[] } | null>(null);
const govSource = ref('');
let data: any;
const dataAvailable = ref(false);
const chartAreaData = ref();
const chartPopulationGHSData = ref();
const chartPopulationGOVData = ref();
const chartOptions = ref();


const setChartAreaData = () => {
  return {
    labels: [ 'Non-DUA area', 'DUA Area', ],
    datasets: [
      {
        label: 'Area in sqkm',
        backgroundColor: [ "#737070", "#efef0c", ],
        borderColor: [ "#737070", "#efef0c", ],
        data: [ data.total - data.DUA_area_sqkm, data.DUA_area_sqkm ]
      },
      {
        label: 'Area in percent',
        backgroundColor: [ "#737070", "#efef0c", ],
        borderColor: [ "#737070", "#efef0c", ],
        data: [ 100 - data.DUA_area_percent, data.DUA_area_percent ]
      }
    ]
  };
};


const setChartPopulationGHSData = () => {
  return {
    labels: ['Non-DUA population', 'DUA population'],
    datasets: [
      {
        label: 'Population in %',
        backgroundColor: ["#737070", "#ef9631" ],
        borderColor: ["#737070", "#f69432" ],
        data: [ 100 - data.DUA_pop_percent_ghs, data.DUA_pop_percent_ghs ]
      }
    ]
  };
};


const setChartPopulationGOVData = () => {
  return {
    labels: ['Non-DUA population', 'DUA population'],
    datasets: [
      {
        label: 'Population in %',
        backgroundColor: ["#737070", "#17f5e1"],
        borderColor: ["#737070", "#13efdd"],
        data: [ 100 - data.DUA_pop_percent_gov, data.DUA_pop_percent_gov ]
      }
    ]
  };
};


const updateCityStatistics = async() => {
  data = await _.find(useStatisticsStore().cityStatistics, (stats) =>
      stats.label === useFeatureStore().label);

  if (data) {
    dataAvailable.value = true;
    chartAreaData.value = setChartAreaData();
    chartPopulationGHSData.value = setChartPopulationGHSData();
    chartPopulationGOVData.value = setChartPopulationGOVData();
    notes.value = _.find(useStatisticsStore().cityStatistics, (entry) => entry.notes);
    govSource.value = data.gov_source;
  } else {
    dataAvailable.value = false;
  }
}


watch(() => useFeatureStore().label, () => {
  updateCityStatistics();
}, { deep: true });
</script>


<style scoped>
* {
  font-size: 10px;
}

.p-chart {
  width: 180px !important;
  height: 180px !important;
}
</style>

