import { defineStore } from 'pinia';
import type Layer from '@/types/Layer';


export const useBaseLayerStore = defineStore('baseLayerStore', {
  state: () => {
    return {
      baseLayers: <Layer[]>[],
      activeBasemap: <Layer[]>[]
    }
  },

  actions: {
    fetchBaseLayers() {
      const baseLayerCollection = [
        {
          id: 0,
          name: 'osm-color',
          slugName: 'osm',
          headerName: 'Open Street Map',
          imgPath: 'preview_osm.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          url: '',
          params: { },
          type: 'baseLayer',
          order: 0,
          zIndex: 0,
          minZoom: 0,
          visible: false,
          loaded: false
        },
        {
          id: 2,
          name: 'satellite-esri',
          slugName: 'esri',
          headerName: 'High-Resolution Satellite (ESRI)',
          imgPath: 'preview_esri.png',
          attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
          type: 'baseMap',
          order: 2,
          zIndex: 0,
          minZoom: 0,
          visible: false,
          loaded: false
        },
        {
          id: 3,
          name: 'sentinel-2-20m',
          slugName: 'tcc',
          headerName: 'Sentinel TCC 2021',
          imgPath: 'preview_s2_20m.png',
          attribution: '© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium.' +
            '<br>With year 2021 for the WorldCover 2021.',
          url: 'https://services.terrascope.be/wms/v2/wms',
          params: { LAYERS: 'WORLDCOVER_2021_S2_TCC', TILED: true, VERSION: '1.1.0'},
          type: 'baseMap',
          order: 3,
          zIndex: 0,
          minZoom: 0,
          apiKey: '',
          visible: false,
          loaded: false
        },
      ]

      if (this.baseLayers.length === 0) {
        baseLayerCollection.forEach((layer: any) => {
          this.baseLayers.push(layer);
        })
      }
    },

    getActiveBaseMap(): Layer {
      return this.baseLayers.filter(item => item.visible)[0];
    }
  }
})
