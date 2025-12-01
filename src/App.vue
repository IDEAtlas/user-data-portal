<script setup lang="ts">

import { useKeycloak } from "@/components/Authentication/keycloak";
import { onMounted } from 'vue';
import LoginLink from "@/components/Authentication/LoginLink.vue";
import LogoutLink from "@/components/Authentication/LogoutLink.vue";

import { useMapStore } from "@/stores/mapStore";
import { useFeatureStore } from "@/stores/featureStore.ts";
import { useMainStore } from "@/stores/mainStore.ts";
import { useStatisticsStore } from "@/stores/statisticsStore.ts";

import Map from '@/components/Map.vue'
import InfoDialogue from "@/components/Dialogues/InfoDialogue.vue";
import EvaluationDialogue from "@/components/Dialogues/EvaluationDialogue.vue";
import _ from 'lodash'
import * as qp from '@/query-params';


const { isAuthenticated, fullName } = useKeycloak();


onMounted(async () => {

  // import config files
  const responseCities = await fetch("/config/cities.json");
  useMainStore().cities = await responseCities.json();

  const responseMultitemporalMaps = await fetch("/config/multitemporal_maps.json");
  useMainStore().multitemporalMaps = await responseMultitemporalMaps.json();
  useMainStore().currentPredictionYear = useMainStore().multitemporalMaps[useMainStore().multitemporalMaps.length - 1];

  const statistics = await fetch("/config/city_statistics.json");
  useStatisticsStore().cityStatistics = await statistics.json();

  // get city from url params
  let predefinedCity: string | undefined = qp.fetchQueryParam("city");
  let item: any = {};

  if (predefinedCity === 'undefined') {
    item.city = 'Others';
    item.country = 'World';
    item.label = 'world';

  } else if (predefinedCity !== undefined) {
    item = _.find(useMainStore().cities, (item) => {
      return item.city === predefinedCity;
    });
    useFeatureStore().city = item.city;
    useFeatureStore().country = item.country;
    useFeatureStore().label = item.label;
  }
  checkIfCityIsMain(item);
  useMapStore().toggleDatasetLayerVisibility('prediction_100m');
});


const goToLocation = (item: any) => {
  // save city to url params
  qp.setQueryParam("city", item.city);

  useFeatureStore().city = item.city;
  useFeatureStore().country = item.country;
  useFeatureStore().label = item.label;

  checkIfCityIsMain(item);

  if (item.label === 'world') {
    useMapStore().resetExtent();
  } else {
    useMapStore().goToLocation(item.location);
  }
  // close city list after selection
  let currentClass = document.getElementsByClassName('city-list')[0].getAttribute('class') || '';
  currentClass += ' hidden';
  document.getElementsByClassName('city-list')[0].setAttribute('class', currentClass);
}


const checkIfCityIsMain = (item: any) => {
  const mainCityLabels = useMainStore().mainCityLabels;
  useMainStore().isMainCity = _.find(mainCityLabels, (label) => label === item.label) !== undefined;
  useMapStore().changePredictionReferenceSource(useFeatureStore().label);
}
</script>


<template>
  <div class="max-h-screen flex flex-column surface-ground">
    <div class="bg-black-900 py-2 px-4 shadow-2 flex align-items-center relative lg:static border-bottom-1
      border-gray-800" style="height:60px">

      <!--   Logos   -->
      <img src="/src/assets/logos/IDEAtlas_logo.png" class="flex-none mr-1" style="width:42px;height:42px;" alt="IDEAtlas Logo"/>
      <Divider layout="vertical" />
      <div>
        <a href="https://www.itc.nl/" target="_blank" class="flex cursor-pointer ">
          <img src="/src/assets/logos/itc-logo-image.png" class="flex-none mr-3" style="width:32px" alt="ITC Twente Image Logo"/>
          <img src="/src/assets/logos/ut-logo-white-en.svg" class="flex-none mr-1" style="width:122px;margin-top:5px;" alt="ITC Twente Text Logo"/>
        </a>
      </div>
      <Divider layout="vertical" />
      <a href="https://www.geoville.com" target="_blank">
        <img src="/src/assets/logos/GeoVille_Logo_White.png" class="flex-none mr-1" style="width:60px;" alt="GeoVille Logo"/>
      </a>
      <Divider layout="vertical" />
      <a href="https://www.esa.int/" target="_blank">
        <img src="/src/assets/logos/ESA_logo.png" class="flex-none mr-1" style="width:60px;margin-top:5px;" alt="GeoVille Logo"/>
      </a>
      <Divider layout="vertical" />

      <!--   Menu   -->
      <a v-ripple class="flex-grow-1 cursor-pointer block lg:hidden text-gray-400 p-ripple"
         v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }">
        <i class="pi pi-bars text-4xl"></i>
      </a>
      <div class="align-items-center flex-grow-1 justify-content-between hidden lg:flex absolute lg:static bg-gray-900
          z-3 left-0 top-100 shadow-2 lg:shadow-none border-1 lg:border-none border-gray-800">
        <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
          <li>
            <a v-ripple class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white
               hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple mx-3"
               @click="useMainStore().infoDialogueVisible = true" style="font-size:14px;">
              <i class="pi pi-info-circle mr-2"></i>
              <span>About IDEAtlas</span>
            </a>
          </li>
          <li>
            <a v-ripple class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white
                hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple"
               v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden',
                  leaveActiveClass: 'fadeout', hideOnOutsideClick: true }"
               style="font-size:14px;">
              <i class="pi pi-building mr-2"></i>
              <span>Cities</span>
              <i class="pi pi-angle-down ml-auto lg:ml-3"></i>
            </a>
            <ul class="city-list list-none py-3 px-6 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:shadow-2 lg:absolute
                bg-gray-900 hidden origin-top w-full lg:w-15rem cursor-pointer lg:border-1 border-gray-800">
              <li v-for="item in useMainStore().cities" @click="goToLocation(item)">
                <a v-ripple class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800
                  transition-colors transition-duration-150 p-ripple">
                  <span class="font-medium">{{ item.city }} ({{ item.country }})</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!--   Authentication   -->
      <div class="flex-none">
        <div>
        <LoginLink
            v-if="!isAuthenticated"
            v-ripple
            class="flex lg:py-2 px-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium
              border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
            <i class="pi pi-sign-in" v-tooltip.bottom="{ value: 'Sign in' }"></i>
        </LoginLink>
      </div>
        <div class="flex w-30rem align-items-center justify-content-end" v-if="isAuthenticated" >
        <div class="flex-nowrap pr-3" style="font-size:13px;">{{ fullName }}</div>
        <LogoutLink
            v-if="isAuthenticated"
            v-ripple
            class="flex px-3 p-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium
              border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
          <i class="pi pi-sign-out" v-tooltip.bottom="{ value: 'Sign out', showDelay: 1000 }"></i>
        </LogoutLink>
      </div>
      </div>
    </div>

    <Map></Map>
    <InfoDialogue></InfoDialogue>
    <EvaluationDialogue v-if="isAuthenticated"></EvaluationDialogue>
  </div>
</template>


<style scoped>
a {
  text-decoration: none;
}

.p-divider {
  width: 1px;
  background-color: #515151;
}

.city-list {
  height: 300px;
  overflow-y: auto;
}
</style>