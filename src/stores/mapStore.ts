import { ref } from "vue";
import { defineStore } from 'pinia';
import { useBaseLayerStore } from '@/stores/baseLayerStore';
import { useDatasetLayerStore } from '@/stores/datasetLayerStore';
import { useFeatureStore } from "@/stores/featureStore.ts";
import { useMainStore } from "@/stores/mainStore.ts";

import * as qp from '@/query-params';
import type Layer from '@/types/Layer';

import Map from 'ol/Map'
import View from 'ol/View';
import { defaults as defaultControls, ScaleLine } from 'ol/control'
import { Interaction } from 'ol/interaction';
import { useGeographic } from 'ol/proj';
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Vector } from "ol/layer";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";


useGeographic();


export const useMapStore = defineStore('mapStore', () => {
  
  const view = new View({
    center: [2, 18],
    zoom: 2,
    enableRotation: false
  });

  const map = new Map({
    view: view,
    controls: defaultControls({attribution: false}).extend([
      new ScaleLine({
        units: 'metric'
      }),
      new ScaleLine({
        units: 'imperial'
      })
    ]),
  });

  const showAttributionDialogue = ref(false);


  const setBaseLayerVisibility = (layerName: string) => {
    
    let baseLayerCollection = useBaseLayerStore().baseLayers;
    baseLayerCollection.forEach((layer: any) => layer.visible = false);

    // set all base maps invisible
    map.getLayers().forEach((item: any) => {
      if (item.getZIndex() < 10) {
        item.setVisible(false);
      }
    });

    // set the selected base map visible and update the base map url parameter
    map.getLayers().forEach((layer: any) => {
      if (layer.getClassName() === layerName) {
        layer.setVisible(true);
        if (baseLayerCollection.length > 0) {
          let currentBaseLayer = baseLayerCollection.find((item: any) => item.name === layerName);
          if (currentBaseLayer) {
            currentBaseLayer.visible = true;
            qp.setQueryParam("basemap", currentBaseLayer.slugName);
          }
        }
      }
    });
  }
  
  
  const addInteraction = (interaction: Interaction) => {
    map.addInteraction(interaction);
  }
  
  
  const removeInteraction = (interaction: Interaction) => {
    map.removeInteraction(interaction);
  }
  
  
  const addLayer = (layer: any) => {
    map.addLayer(layer);
  }
  
  
  const removeLayer = (layer: any) => {
    map.removeLayer(layer);
  }


  const resetExtent = () => {
    view.setCenter([2, 18]);
    view.setZoom(2);
  }


  const goToLocation = (location: any, zoomFactor = 10, addMarker = false) => {
    view.setCenter(location);
    view.setZoom(zoomFactor);

    if (addMarker) {
      setMarker(location);
    }
  }


  const setMarker = (location: any) => {
    const iconFeature = new Feature({
      geometry: new Point(location),
    });

    const geoSearchMarker = new Vector({
      source: new VectorSource({
        features: [iconFeature]
      }),
      style: new Style({
        image: new Icon({
          src: 'geomarker.png',
          scale: 0.5
        })
      })
    })

    map.addLayer(geoSearchMarker);

    setTimeout(() => map.removeLayer(geoSearchMarker), 5000);
  }


  const toggleDatasetLayerVisibility = (layerName: string) => {
    let datasetLayerCollection: Layer[] = useDatasetLayerStore().datasetLayers;

    map.getLayers().forEach(layer => {
      if (layer.getClassName() === layerName) {
        layer.setVisible(!layer.getVisible());
      }
    });
    
    datasetLayerCollection.forEach(dataset => {
      if (dataset.name === layerName) dataset.visible = !dataset.visible;
    });
  }


  const setAuthorizedLayersVisible = () => {
    map.getLayers().forEach(layer => {
      if (layer.getClassName() === 'IDEAtlas_evaluation' ||
      layer.getClassName() === 'cities' ||
        layer.getClassName() === 'prediction_10m' ||
      layer.getClassName() === 'reference_10m') {
        layer.setVisible(true);
      } else if (layer.getClassName() === 'prediction_100m') {
        layer.setVisible(false);
      }
    });
  }


  const setUnauthorizedLayersVisible = () => {
    map.getLayers().forEach(layer => {
      if (layer.getClassName() === 'IDEAtlas_evaluation' ||
        layer.getClassName() === 'cities' ||
        layer.getClassName() === 'prediction_100m') {
        layer.setVisible(true);
      } else if (layer.getClassName() === 'prediction_10m' ||
      layer.getClassName() === 'reference_10m') {
        layer.setVisible(false);
      }
    });
  }


  const updateEvaluationLayer = () => {
    map.getLayers().forEach(layer => {
      if (layer.getClassName() === 'IDEAtlas_evaluation') {
        // @ts-ignore
        layer.getSource().refresh();
      }
    })
    useFeatureStore().updateEvaluation = true;
  }


  const changeLayerOpacity = (layerName: string, opacityValue: number) => {
    map.getLayers().forEach((layer: any) => {
      if (layer.getClassName() == layerName) {
        layer.setOpacity(opacityValue/100);
      }
    });
    const item = useDatasetLayerStore().datasetLayers.find(item => item.name === layerName);
    if (item) item.opacity = opacityValue;
  }


  const changePredictionReferenceSource = (label: string) => {

    map.getLayers().forEach((layer: any) => {
      if (useMainStore().isMainCity) {
        if (layer.getClassName() == 'prediction_10m') {
          layer.getSource().updateParams({ 'LAYERS': label + '_' + useMainStore().currentPredictionYear + '_prediction_10m' })
        }
        if (layer.getClassName() == 'prediction_100m') {
          layer.getSource().updateParams({ 'LAYERS': label + '_' + useMainStore().currentPredictionYear + '_prediction_100m' })
        }
      } else {
        if (layer.getClassName() == 'prediction_10m') {
          layer.getSource().updateParams({ 'LAYERS': label + '_prediction_10m' })
        }
        if (layer.getClassName() == 'prediction_100m') {
          layer.getSource().updateParams({ 'LAYERS': label + '_prediction_100m' })
        }
      }

      if (layer.getClassName() == 'reference_10m') {
        layer.getSource().updateParams({ 'LAYERS': label + '_reference_10m' })
      }
      if (layer.getClassName() == 'ssi_100m') {
        layer.getSource().updateParams({ 'LAYERS': label + '_ssi_100m' })
      }
    })
  }


  return {
    map,
    showAttributionDialogue,
    setBaseLayerVisibility,
    addInteraction,
    removeInteraction,
    addLayer,
    removeLayer,
    goToLocation,
    resetExtent,
    toggleDatasetLayerVisibility,
    updateEvaluationLayer,
    changeLayerOpacity,
    changePredictionReferenceSource,
    setAuthorizedLayersVisible,
    setUnauthorizedLayersVisible
  }
});