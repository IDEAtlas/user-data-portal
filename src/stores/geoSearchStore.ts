import axios_photon_services from "@/services/axios-photon-services";
import type GeoSearchItem from "@/types/GeoSearchItem";
import { defineStore } from "pinia";
import { useFeatureStore } from "@/stores/featureStore.ts";


export const useGeoSearchStore = defineStore("geoSearchStore", {
  state: () => {
    return {
      searchResult: [] as GeoSearchItem[],
      geoSearchLoading: false
    };
  },
  actions: {
    async getSearchResult(
      searchStr: string,
      limit: number = 100
    ) {
      let geoSearchResultCollection: any[];

      if (useFeatureStore().label == 'world') {
        await axios_photon_services
          .get("api/?q=" + searchStr + "&limit=" + limit + "&lang=en")
          .then((response) => {
            this.searchResult = [];
            geoSearchResultCollection = response.data.features;

            geoSearchResultCollection.forEach((result: any) => {
              this.searchResult.push({
                location: result.properties.name,
                coordinates: result.geometry.coordinates
              });
            });
            this.geoSearchLoading = false;
          })
          .catch((error) => {
            console.log("Error: ", error);
            this.geoSearchLoading = false;
          });
      } else {
        await axios_photon_services
          .get("api/?q=" + useFeatureStore().city + " " + searchStr + "&limit=" + limit + "&lang=en")
          .then((response) => {
            this.searchResult = [];
            geoSearchResultCollection = response.data.features;

            geoSearchResultCollection.forEach((result: any) => {
              if ((useFeatureStore().city == '') ||
                (useFeatureStore().city != '' && result.properties.city == useFeatureStore().city) ||
                (useFeatureStore().city == 'Buenos Aires' && result.properties.state == 'Autonomous City of Buenos Aires') ||
                (useFeatureStore().city == 'Lagos' && result.properties.state == 'Lagos')) {

                this.searchResult.push({
                  location: result.properties.name,
                  coordinates: result.geometry.coordinates
                });
              }
            });
            this.geoSearchLoading = false;
          })
          .catch((error) => {
            console.log("Error: ", error);
            this.geoSearchLoading = false;
          });
      }
    }
  }
});
