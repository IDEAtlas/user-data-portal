import { defineStore } from 'pinia';
import type Layer from '@/types/Layer';


export const useDatasetLayerStore = defineStore('datasetLayerStore', {
  state: () => {
    return {
      datasetCollection: <Layer[]>[],
      datasetLayers: <Layer[]>[]
    }
  },

  actions: {
    getDatasetPool() {
      this.datasetCollection = [
        {
          id: 0,
          name: 'cities',
          slugName: 'cities',
          headerName: 'City Boundary',
          imgPath: '',
          description: '',
          attributionHeader: '',
          attribution: '',
          url: 'https://portal.ideatlas.eu/geoserver/ideatlas/wms',
          params: { LAYERS: 'city_boundaries_raster', TILED: true, VERSION: '1.1.0' },
          type: 'wmsDatasetLayer',
          order: 0,
          zIndex: 30,
          minZoom: 1,
          size: '',
          visible: true,
          opacity: 100,
          loaded: false,
          restricted: false,
          legend: 'rgba(246,40,96,0.8)',
          legendType: 'line'
        },
        {
          id: 1,
          name: 'IDEAtlas_evaluation',
          slugName: 'IDEAtlas_evaluation',
          headerName: 'IDEATLAS Evaluation',
          imgPath: '',
          description: '',
          attributionHeader: '',
          attribution: '',
          url: '',
          params: {},
          type: 'wfsDatasetLayer',
          order: 0,
          zIndex: 31,
          minZoom: 1,
          size: '',
          visible: false,
          opacity: 100,
          loaded: false,
          restricted: true,
          legend: 'evaluation-legend.png',
          legendType: 'image'
        },
        {
          id: 2,
          name: 'prediction_10m',
          slugName: 'prediction_10m',
          headerName: 'Prediction 10 m',
          imgPath: '',
          description: 'Sentinel-2 – Informal built-up',
          attributionHeader: '',
          attribution: '',
          url: 'https://portal.ideatlas.eu/geoserver/ideatlas/wms',
          params: { LAYERS: '_prediction_10m', TILED: true, VERSION: '1.1.0' },
          type: 'wmsDatasetLayer',
          order: 1,
          zIndex: 25,
          minZoom: 0,
          size: '',
          visible: false,
          opacity: 50,
          loaded: false,
          restricted: true,
          legend: 'rgba(238,48,45,0.8)',
          legendType: 'polygon'
        },
        {
          id: 3,
          name: 'reference_10m',
          slugName: 'reference_10m',
          headerName: 'Reference 10 m',
          imgPath: '',
          description: 'Sentinel-2 – Informal built-up',
          attributionHeader: '',
          attribution: '',
          url: 'https://portal.ideatlas.eu/geoserver/ideatlas/wms',
          params: { LAYERS: '_reference_10m', TILED: true, VERSION: '1.1.0' },
          type: 'wmsDatasetLayer',
          order: 1,
          zIndex: 20,
          minZoom: 0,
          size: '',
          visible: false,
          opacity: 50,
          loaded: false,
          restricted: true,
          legend: 'rgba(250,197,22,0.8)',
          legendType: 'polygon'
        },
        {
          id: 4,
          name: 'prediction_100m',
          slugName: 'prediction_100m',
          headerName: 'Prediction 100 m',
          imgPath: '',
          description: 'Sentinel-2 – Informal built-up',
          attributionHeader: '',
          attribution: '',
          url: 'https://portal.ideatlas.eu/geoserver/ideatlas/wms',
          params: { LAYERS: '_prediction_100m', TILED: true, VERSION: '1.1.0' },
          type: 'wmsDatasetLayer',
          order: 1,
          zIndex: 25,
          minZoom: 0,
          size: '',
          visible: false,
          opacity: 50,
          loaded: false,
          restricted: false,
          legend: 'rgba(238,48,45,0.8)',
          legendType: 'polygon'
        },
        {
          id: 5,
          name: 'ssi_100m',
          slugName: 'ssi_100m',
          headerName: 'SSI 100 m',
          imgPath: '',
          description: 'Slum Severity Index',
          attributionHeader: '',
          attribution: '',
          url: 'https://portal.ideatlas.eu/geoserver/ideatlas/wms',
          params: { LAYERS: '_ssi_100m', TILED: true, VERSION: '1.1.0' },
          type: 'wmsDatasetLayer',
          order: 1,
          zIndex: 15,
          minZoom: 0,
          size: '',
          visible: false,
          opacity: 50,
          loaded: false,
          restricted: false,
          legend: 'rgb(87,203,206)',
          legendType: 'ssi_image'
        },
        {
          id: 6,
          name: 'ghs_uc_2019',
          slugName: 'ghs_uc_2019',
          headerName: 'GHSL 2019',
          imgPath: '',
          description: '',
          attributionHeader: '',
          attribution: '',
          url: 'https://portal.ideatlas.eu/geoserver/ideatlas/wms',
          params: { LAYERS: 'ghs_uc_2019', TILED: true, VERSION: '1.1.0' },
          type: 'wmsDatasetLayer',
          order: 1,
          zIndex: 27,
          minZoom: 0,
          size: '',
          visible: false,
          opacity: 100,
          loaded: false,
          restricted: false,
          legend: 'rgb(244,150,9)',
          legendType: 'line'
        }
      ]

      if (this.datasetLayers.length === 0) {
        this.datasetCollection.forEach((layer: any) => {
          this.datasetLayers.push(layer);
        })
      }
    },

    getUnauthorizedDatasets(): void {
      this.datasetLayers = [];
      const unauthorizedDatasetIndices = [0, 4, 5, 6];
      let newCollection = this.datasetCollection.filter(
        (item) => unauthorizedDatasetIndices.includes(item.id)
      );
      newCollection.forEach((item) => this.datasetLayers.push(item));
    },

    getAuthorizedDatasets(): void {
      this.datasetLayers = [];
      const authorizedDatasetIndices = [0, 1, 2, 3, 5, 6];
      let newCollection = this.datasetCollection.filter(
        (item) => authorizedDatasetIndices.includes(item.id)
      );
      newCollection.forEach((item) => this.datasetLayers.push(item));
    },

    setMenuDatasetsVisible(): void {
      this.datasetLayers.slice(0, 4).forEach((item) => {
        item.visible = true;
      });
    }
  }
})
