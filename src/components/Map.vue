<template>

  <Button id="btn-stats" class="map-button" @click="useMainStore().statisticsDialogueVisible = !useMainStore().statisticsDialogueVisible;
    useMainStore().baseLayerMenuVisible = false;useMainStore().datasetMenuVisible = false;" v-tooltip.top="'City Statistics'">
    <img alt="statistics" src="@/assets/icons/icon-stats.svg"/>
  </Button>
  <Button id="btn-globe" class="map-button" @click="useMainStore().baseLayerMenuVisible = !useMainStore().baseLayerMenuVisible;
    useMainStore().datasetMenuVisible = false;" v-tooltip.top="'Basemaps'">
    <img alt="globe" src="@/assets/icons/icon-globe.svg"/>
  </Button>
  <Button id="btn-layers" class="map-button" @click="useMainStore().datasetMenuVisible = !useMainStore().datasetMenuVisible;
    useMainStore().baseLayerMenuVisible = false;" v-tooltip.top="'Datasets'">
    <img alt="layers" src="@/assets/icons/icon-layers.svg"/>
  </Button>
  <Button id="btn-geosearch" class="map-button" @click="useMainStore().geoSearchDialogueVisible = !useMainStore().geoSearchDialogueVisible;"
          v-tooltip.top="'GeoSearch'">
    <img alt="geosearch" src="@/assets/icons/icon-explore.svg"/>
  </Button>

  <div id="map" class="map"></div>

  <BaseLayerMenu v-if="useMainStore().baseLayerMenuVisible" />
  <LayerMenu v-if="useMainStore().datasetMenuVisible"/>

  <GeoSearchDialogue v-if="useMainStore().geoSearchDialogueVisible"></GeoSearchDialogue>
  <AttributionDialogue></AttributionDialogue>
  <Attribution></Attribution>
  <EditingControl v-if="isAuthenticated && useMainStore().editingControlVisible"></EditingControl>
  <EditingControlMinimized v-if="isAuthenticated && !useMainStore().editingControlVisible"></EditingControlMinimized>
  <StatisticsDialogue></StatisticsDialogue>
  <Toast />

</template>


<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useKeycloak } from '@/components/Authentication/keycloak';
import { useMainStore } from '@/stores/mainStore';
import { useMapStore } from '@/stores/mapStore';
import { useBaseLayerStore } from '@/stores/baseLayerStore';
import { useFeatureStore } from '@/stores/featureStore';
import { useDatasetLayerStore } from '@/stores/datasetLayerStore';
import { storeToRefs } from 'pinia';
import { useToast } from "primevue/usetoast";
import axios_auth_services from "@/services/axios-auth-services.ts";

import * as qp from '@/query-params';
import * as turf from '@turf/turf'
import * as _ from "lodash";

import BaseLayerMenu from '@/components/Basemaps/BaseLayerMenu.vue';
import LayerMenu from './Datasets/LayerMenu.vue';
import AttributionDialogue from '@/components/Attribution/AttributionDialogue.vue';
import Attribution from '@/components/Attribution/Attribution.vue';
import GeoSearchDialogue from "@/components/Dialogues/GeoSearchDialogue.vue";
import EditingControl from "@/components/Dialogues/EditingControl.vue";
import EditingControlMinimized from "@/components/Dialogues/EditingControlMinimized.vue";

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON, GML } from 'ol/format';
import { DragPan, Draw, Interaction, Modify, Select } from 'ol/interaction';
import { ImageWMS, TileWMS, XYZ } from 'ol/source';
import ImageLayer from 'ol/layer/Image';
import { Fill, Stroke, Style } from 'ol/style';
import { useGeographic } from 'ol/proj';
import CircleStyle from "ol/style/Circle";
import { MultiPoint } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { FeatureLoader } from "ol/featureloader";
import { Extent } from "ol/extent";
import StatisticsDialogue from "@/components/Dialogues/StatisticsDialogue.vue";


const createSuccessful = ref(false);
const deleteSuccessful = ref(false);

const { sub, isAuthenticated } = useKeycloak();
const { oldFeature, newFeature, city, country, evalClass, comment, featureIsIntersected,
  saveEdits, resetEdits, editingMode, enableSaveEdits, enableReset, commands, currentCommand,
  updateGeometry, updateEvalClass, updateAttribute, updateComment, updateEvaluation } = storeToRefs(useFeatureStore());


const mapStore = useMapStore();
let map = mapStore.map;
let evaluationLayer: any;
let evaluationSource: any;
let evaluationStyle: any, wfsSelectStyle: any, wfsCreateStyle: any;
let drawLayer: any;
let drawSource: any;
let createInteraction: any;
let updateInteraction: any;
let modifyInteraction: any;
let deleteInteraction: any;
let dragPanInteraction: any;
let selectInteraction: any;
let newGeometry: any;
let newCoordinates: any;
let fid: string;


useGeographic();
const toast = useToast();


onMounted(async () => {

  setUrlParameters();
  initMap();

  map.getInteractions().forEach(function (interaction: Interaction) {
    if (interaction instanceof DragPan) {
      dragPanInteraction = interaction;
    }
  });
});


const initMap = () => {

  useMapStore().map.getViewport().style.cursor = "grab";
  // add base maps and dataset layers
  defineMapStyles();
  initBaseMaps();
  initDataSetLayers();

  map.on('movestart', () => {
    useMapStore().map.getViewport().style.cursor = "grabbing";
  })

  map.on('moveend', () => {
    useMapStore().map.getViewport().style.cursor = "grab";
    const center = map.getView().getCenter();
    if (center) qp.setQueryParam("lat", center[0].toString());
    if (center) qp.setQueryParam("lon", center[1].toString());

    const zoom = map.getView().getZoom();
    if (zoom) qp.setQueryParam("zoom", zoom.toString());
  });

  map.setTarget('map');
}


const initBaseMaps = () => {

  useBaseLayerStore().fetchBaseLayers();

  let baseLayers: any = useBaseLayerStore().baseLayers;
  for (let key in baseLayers) {
    let newSource;
    if (baseLayers[key].name === 'osm-color') {
      newSource = new OSM({
        attributions: baseLayers[key].attribution
      });
    } else if (baseLayers[key].name === "satellite-esri") {
      newSource = new XYZ({
        url: baseLayers[key].url,
        attributions: baseLayers[key].attribution,
        minZoom: 1,
        maxZoom: 19,
        interpolate: false
      })
    } else {
      newSource = new TileWMS({
        url: baseLayers[key].url,
        params: baseLayers[key].params,
        attributions: baseLayers[key].attribution
      });
    }

    map.addLayer(new TileLayer({
      source: newSource,
      className: baseLayers[key].name,
      preload: Infinity,
      zIndex: baseLayers[key].zIndex,
      minZoom: baseLayers[key].minZoom,
      visible: false
    }));

    // get/set basemap
    let urlBasemap: any = qp.fetchQueryParam("basemap");
    if (urlBasemap !== undefined) {
      const activeBaseMap = useBaseLayerStore().baseLayers.find(item => item.slugName === urlBasemap);
      if (activeBaseMap) useMapStore().setBaseLayerVisibility(activeBaseMap.name);
    } else {
      useMapStore().setBaseLayerVisibility(useBaseLayerStore().baseLayers[0].name);
      qp.setQueryParam("basemap", useBaseLayerStore().baseLayers[0].slugName);
    }
  }
}


const loadEvaluationLayer = () => {

  const evaluationUrl = "https://portal.ideatlas.eu/geoserver/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=ideatlas:ideatlas_evaluation&outputFormat=application/json";

  evaluationSource = new VectorSource({
    format: new GeoJSON(),
    loader: function (extent: Extent) {
      const url = evaluationUrl;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.setRequestHeader("Authorization", useMainStore().basicAuth);

      xhr.onerror = function () {
        console.error("Error loading features");
        evaluationSource.removeLoadedExtent(extent);
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const features = evaluationSource.getFormat().readFeatures(xhr.responseText);
          evaluationSource.addFeatures(features);
        } else {
          console.error(`Failed to load features: ${xhr.statusText}`);
          evaluationSource.removeLoadedExtent(extent);
        }
      };
      xhr.send();
    } as FeatureLoader
  });


  evaluationLayer = new VectorLayer({
    className: 'IDEAtlas_evaluation',
    source: evaluationSource,
    zIndex: 40,
    style: evaluationStyle,
  });

  evaluationLayer.set('selectable', true);
  useMapStore().map.addLayer(evaluationLayer);
}


const initDataSetLayers = () => {

  useDatasetLayerStore().getDatasetPool();

  let datasetLayers: any = useDatasetLayerStore().datasetLayers;

  for (let key in datasetLayers) {
    let newSource;

    if (datasetLayers[key].type === 'wmsDatasetLayer') {
      newSource = new ImageWMS({
        url: datasetLayers[key].url,
        params: datasetLayers[key].params,
        attributions: datasetLayers[key].attribution,
        imageLoadFunction: imageLoader,
      });

      map.addLayer(new ImageLayer({
        source: newSource,
        className: datasetLayers[key].name,
        zIndex: datasetLayers[key].zIndex,
        minZoom: datasetLayers[key].minZoom,
        visible: datasetLayers[key].visible,
        opacity: datasetLayers[key].opacity / 100
      }));
    }
  }

  useMapStore().changePredictionReferenceSource(useFeatureStore().label);
}


const initDrawLayer = () => {

  drawSource = new VectorSource();
  drawLayer = new VectorLayer({
    className: 'drawLayer',
    source: drawSource,
    zIndex: 50,
    style: wfsSelectStyle
  });
}


const prepareNewEditingMode = () => {
  useFeatureStore().resetCategories(true, true);
  drawSource.clear();
  evaluationSource.refresh();
  useMapStore().removeLayer(drawLayer);
  enableSaveEdits.value = false;
  enableReset.value = false;
  oldFeature.value = undefined;
  newFeature.value = undefined;
  evalClass.value = '';
  comment.value = '';
  updateEvalClass.value = false;
  updateGeometry.value = false;
  updateAttribute.value = false;
  updateComment.value = false;

  if (createInteraction) useMapStore().removeInteraction(createInteraction);
  if (selectInteraction) useMapStore().removeInteraction(selectInteraction);
  if (updateInteraction) useMapStore().removeInteraction(updateInteraction);
  if (deleteInteraction) useMapStore().removeInteraction(deleteInteraction);
  if (dragPanInteraction) useMapStore().removeInteraction(dragPanInteraction);
}


const createFeature = () => {

  createInteraction = new Draw({
    source: drawSource,
    type: 'MultiPolygon',
    style: wfsCreateStyle
  });

  useMapStore().addInteraction(createInteraction);

  createInteraction.on('drawstart', () => {

    if (drawSource.getFeatures().length > 0) {
      useMapStore().removeInteraction(createInteraction);
      toast.add({ severity: 'warn', summary: 'Warning', detail: "Don't forget to save your polygon!", life: 3000 });
      return;
    }
    currentCommand.value = commands.value.create.step1;
  })

  createInteraction.on('drawend', (e: any) => {
    let newTempFeature = e.feature;

    if (newTempFeature) {

      // check for intersection
      const coordinates = newTempFeature.clone().getGeometry().getCoordinates()[0];
      const poly = turf.polygon(coordinates);

      if (turf.kinks(poly).features.length > 0) {

        // show a warning of intersected polygon and delete it afterward
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Polygon must not intersect itself and cannot be saved', life: 3000 });
        enableSaveEdits.value = false;
        setTimeout(() => {  // resetEdits.value = true;
          }, 3000);
      } else {
        let polygonArea = turf.area(poly)
        let polygonAreaFormatted = (polygonArea/1000000).toFixed(2);
        toast.add({ severity: 'info', summary: 'Info', detail: `Polygon has an area of ${polygonAreaFormatted} km²`, life: 3000 });

        // register polygon
        newFeature.value = newTempFeature;
        let newFeatureGeometry = newTempFeature.clone().getGeometry();
        if (newFeatureGeometry) {
          newGeometry = newFeatureGeometry;
        }
      }
    }
    createSuccessful.value = true;
    currentCommand.value = commands.value.create.step2;
  });
}


const insertWFSTransact = () => {

  let formatGML = new GML( { multiSurface: false });
  const gmlGeometry = formatGML.writeGeometry(newGeometry, { });

  const housing = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'housing' })?.checked || false;
  const environment = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'environment' })?.checked || false;
  const infrastructure = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'infrastructure' })?.checked || false;
  const social = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'social' })?.checked || false;
  const settlement = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'settlement' })?.checked || false;

  if (comment.value == undefined) comment.value = "";

  const payload = '<wfs:Transaction service="WFS" version="1.1.0" ' +
    'xmlns:ideatlas="http://portal.ideatlas.eu" ' +
    'xmlns:ogc="http://www.opengis.net/ogc" ' +
    'xmlns:wfs="http://www.opengis.net/wfs" ' +
    'xmlns:gml="http://www.opengis.net/gml" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xsi:schemaLocation="http://www.opengis.net/wfs http://portal.ideatlas.eu/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd">' +
    '<wfs:Insert>' +
    '<ideatlas:ideatlas_evaluation xmlns:ideatlas="http://portal.ideatlas.eu">' +
    gmlGeometry +
    '<ideatlas:city>' + city.value + '</ideatlas:city>' +
    '<ideatlas:country>' + country.value + '</ideatlas:country>' +
    '<ideatlas:class>' + evalClass.value + '</ideatlas:class>' +
    '<ideatlas:housing>' + housing + '</ideatlas:housing>' +
    '<ideatlas:environment>' + environment + '</ideatlas:environment>' +
    '<ideatlas:infrastructure>' + infrastructure + '</ideatlas:infrastructure>' +
    '<ideatlas:social>' + social + '</ideatlas:social>' +
    '<ideatlas:settlement>' + settlement + '</ideatlas:settlement>' +
    '<ideatlas:comment>' + comment.value + '</ideatlas:comment>' +
    '<ideatlas:user>' + sub.value + '</ideatlas:user>' +
    '<ideatlas:updated_at>' + new Date().toISOString() + '</ideatlas:updated_at>' +
    '</ideatlas:ideatlas_evaluation>' +
    '</wfs:Insert>' +
    '</wfs:Transaction>';

  const options = {
    headers: {'Content-Type': 'text/xml', 'Authorization': useMainStore().basicAuth }
  };

  axios_auth_services.post('/wfs', payload, options)
    .then( () => {
      useFeatureStore().resetCategories(true, true);
      drawSource.clear();
      evaluationSource.refresh();
      newFeature.value = undefined;
      evalClass.value = '';
      comment.value = '';

      if (useFeatureStore().editingMode === 'create') {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Polygon was successfully saved', life: 3000 });
        useMapStore().addInteraction(createInteraction);
        useMapStore().map.getViewport().style.cursor = "crosshair";
      }
      if (useFeatureStore().editingMode === 'delete') {
        deleteSuccessful.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Polygon was successfully restored', life: 3000 });
      }
      useFeatureStore().currentCommand = (useFeatureStore().commands as any)[useFeatureStore().editingMode].general;
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error', detail: `An error occurred when saving the polygon`, life: 3000 });
      console.log("Error: ", error);
    })
}


const updateWFSTransact = (coordinates: any, fid: any) => {

  const housing = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'housing' })?.checked || false;
  const environment = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'environment' })?.checked || false;
  const infrastructure = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'infrastructure' })?.checked || false;
  const social = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'social' })?.checked || false;
  const settlement = _.find(useFeatureStore().newCategories,  (item) => { return item.column === 'settlement' })?.checked || false;


  let payload = '<wfs:Transaction service="WFS" version="1.0.0" xmlns:ideatlas="http://portal.ideatlas.eu" \n' +
    'xmlns:ogc="http://www.opengis.net/ogc" xmlns:wfs="http://www.opengis.net/wfs" \n' +
    'xmlns:gml="http://www.opengis.net/gml">\n' +
    '<wfs:Update typeName="ideatlas:ideatlas_evaluation">\n' +
    '<wfs:Property>\n' +
    '<wfs:Name>geom</wfs:Name>\n' +
    '<wfs:Value>\n' +
    '<gml:Polygon>\n' +
      '<gml:outerBoundaryIs>\n' +
        '<gml:LinearRing>\n' +
          '<gml:coordinates decimal="." cs="," ts=",">\n' +
              coordinates +
          '</gml:coordinates>\n' +
        '</gml:LinearRing></gml:outerBoundaryIs></gml:Polygon>\n' +
    '</wfs:Value></wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>class</wfs:Name>\n' +
      '<wfs:Value>' + evalClass.value + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>housing</wfs:Name>\n' +
      '<wfs:Value>' + housing + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>environment</wfs:Name>\n' +
      '<wfs:Value>' + environment + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>infrastructure</wfs:Name>\n' +
      '<wfs:Value>' + infrastructure + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>social</wfs:Name>\n' +
      '<wfs:Value>' + social + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>settlement</wfs:Name>\n' +
      '<wfs:Value>' + settlement + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>comment</wfs:Name>\n' +
      '<wfs:Value>' + comment.value + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<wfs:Property>\n' +
      '<wfs:Name>updated_at</wfs:Name>\n' +
      '<wfs:Value>' + new Date().toISOString() + '</wfs:Value>\n' +
    '</wfs:Property>\n' +
    '<ogc:Filter>\n' +
    '<ogc:FeatureId fid="' + fid + '"/>\n' +
    '</ogc:Filter>\n' +
    '</wfs:Update>\n' +
    '</wfs:Transaction>\n';

  const options = {
    headers: {'Content-Type': 'text/xml', 'Authorization': useMainStore().basicAuth }
  };

  axios_auth_services.post('/wfs', payload, options)
    .then(() => {
      useFeatureStore().resetCategories(true, true);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Polygon was successfully saved', life: 3000 });
      resetAll();
      useFeatureStore().currentCommand = (useFeatureStore().commands as any)[useFeatureStore().editingMode].general;
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error', detail: `An error occurred when updating the polygon`, life: 3000 });
      console.log("Error: ", error);
    })
}


const updateFeature = () => {

  selectInteraction = new Select({
    layers: (layer) => {
      return layer.get('selectable') === true;
    },
    style: wfsSelectStyle
  });
  map.addInteraction(selectInteraction);

  selectInteraction.on('select', function (e: any) {
    if (e && e.selected.length > 0) {
      if (sub.value !== e.selected[0].getProperties().user && sub.value !== import.meta.env.VITE_ADMIN_USER_ID) {
        oldFeature.value = undefined;
        newFeature.value = undefined;
        selectInteraction.getFeatures().clear();
        return;
      }
      oldFeature.value = e.selected[0];
      newFeature.value = e.selected[0];
      newCoordinates = e.selected[0].clone().getGeometry().getCoordinates();
      evalClass.value = newFeature.value.getProperties().class;

      useFeatureStore().newCategories = [
        { name: "Housing conditions", column: "housing", key: "A", checked: newFeature.value.getProperties().housing },
        { name: "Environment & climate", column: "environment", key: "B", checked: newFeature.value.getProperties().environment },
        { name: "Infrastructure & services", column: "infrastructure", key: "C", checked: newFeature.value.getProperties().infrastructure },
        { name: "Social & security", column: "social", key: "D", checked: newFeature.value.getProperties().social },
        { name: "Settlement layout & density", column: "settlement", key: "E", checked: newFeature.value.getProperties().settlement }
      ];

      useFeatureStore().oldCategories = _.cloneDeep(useFeatureStore().newCategories);
      comment.value = newFeature.value.getProperties().comment;
      if (comment.value == undefined) comment.value = "";
      useFeatureStore().currentCommand = useFeatureStore().commands.update.step1;
    } else {
      useFeatureStore().currentCommand = useFeatureStore().commands.update.general;
      resetAll();
    }
  });


  updateInteraction = new Modify({
    features: selectInteraction.getFeatures(),
    style: evaluationStyle
  });

  map.addInteraction(updateInteraction);

  updateInteraction.on('modifystart', () => {
    enableSaveEdits.value = true;
    enableReset.value = true;
  });

  updateInteraction.on('modifyend', (evt: any) => {
    let newFeature = evt.features.getArray()[0];

    if (newFeature) {
      updateGeometry.value = false;

      // check for intersection
      const coordinates = newFeature.clone().getGeometry().getCoordinates()[0];
      const poly = turf.polygon(coordinates);

      if (turf.kinks(poly).features.length > 0) {

        // show a warning of intersected polygon and reset it afterwards
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Polygon must not intersect itself and cannot be saved', life: 3000 });
        featureIsIntersected.value = true;
      } else {
        featureIsIntersected.value = false;
        let polygonArea = turf.area(poly)
        let polygonAreaFormatted = (polygonArea/1000000 as number).toFixed(2);
        toast.add({ severity: 'info', summary: 'Info', detail: `Polygon has an area of ${polygonAreaFormatted} km²`, life: 3000 });
        let featureGeometry = newFeature.clone().getGeometry();
        newCoordinates = featureGeometry.getCoordinates();
        updateGeometry.value = true;
      }
    }
  });
}


const deleteFeature = () => {

  deleteInteraction = new Select({
    layers: (layer) => {
      return layer.get('selectable') === true;
    },
    style: wfsSelectStyle
  });
  map.addInteraction(deleteInteraction);

  deleteInteraction.on('select', function (e: any) {
    deleteSuccessful.value = false;
    if (e && e.selected.length > 0) {
      useFeatureStore().currentCommand = useFeatureStore().commands.delete.step1;
      enableReset.value = false;
      fid = e.selected[0].getId();

      if (sub.value !== e.selected[0].getProperties().user && sub.value !== import.meta.env.VITE_ADMIN_USER_ID) {
        oldFeature.value = undefined;
        newFeature.value = undefined;
        deleteInteraction.getFeatures().clear();
        return;
      }

      oldFeature.value = e.selected[0].clone();
      evalClass.value = oldFeature.value.getProperties().class;

      useFeatureStore().oldCategories = [
        { name: "Housing conditions", column: "housing", key: "A", checked: oldFeature.value.getProperties().housing },
        { name: "Environment & climate", column: "environment", key: "B", checked: oldFeature.value.getProperties().environment },
        { name: "Infrastructure & services", column: "infrastructure", key: "C", checked: oldFeature.value.getProperties().infrastructure },
        { name: "Social & security", column: "social", key: "D", checked: oldFeature.value.getProperties().social },
        { name: "Settlement layout & density", column: "settlement", key: "E", checked: oldFeature.value.getProperties().settlement }
      ];

      useFeatureStore().newCategories = _.cloneDeep(useFeatureStore().oldCategories);

      comment.value = oldFeature.value.getProperties().comment;
      if (comment.value == undefined) comment.value = "";
      enableSaveEdits.value = true;
      enableReset.value = false;
    } else {
      useFeatureStore().currentCommand = useFeatureStore().commands.delete.general;
      evalClass.value = '';
      comment.value = '';
      enableSaveEdits.value = false;
    }
  });
}


const deleteWFSTransact = (fid: string) => {

  const payload = '<wfs:Transaction service="WFS" version="1.0.0" ' +
    'xmlns:cdf="http://www.opengis.net/cite/data" ' +
    'xmlns:ogc="http://www.opengis.net/ogc" ' +
    'xmlns:wfs="http://www.opengis.net/wfs" ' +
    'xmlns:ideatlas="http://portal.ideatlas.eu">' +
    '<wfs:Delete typeName="ideatlas:ideatlas_evaluation">' +
    '<ogc:Filter>' +
    '<ogc:FeatureId fid="' + fid + '"/> ' +
    '</ogc:Filter>' +
    '</wfs:Delete>' +
    '</wfs:Transaction>';

  const options = {
    headers: {'Content-Type': 'text/xml', 'Authorization': useMainStore().basicAuth }
  };
  axios_auth_services.post('/wfs', payload, options)
    .then(() => {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Polygon was successfully deleted', life: 3000 });
      evaluationSource.refresh();
      evalClass.value = '';
      comment.value = '';
      enableSaveEdits.value = false;
      deleteSuccessful.value = true;
      useFeatureStore().currentCommand = useFeatureStore().commands.delete.step2;
      useFeatureStore().resetCategories(false, true);
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred when deleting polygon', life: 3000 });
      console.log("Error: ", error);
    })
}


const resetAll = () => {
    oldFeature.value = undefined;
    newFeature.value = undefined;
    evaluationSource.refresh();
    selectInteraction.getFeatures().clear();
    // updateInteraction.getFeatures().clear();
    evalClass.value = '';
    comment.value = '';
    enableReset.value = false;
    enableSaveEdits.value = false;
    updateGeometry.value = false;
    updateEvalClass.value = false;
    updateAttribute.value = false;
    updateComment.value = false;
 }


const setUrlParameters = () => {
  // get/set zoom
  let urlZoom: any = qp.fetchQueryParam("zoom");
  if (urlZoom !== undefined) {
    map.getView().setZoom(urlZoom);
  } else {
    const zoom = map.getView().getZoom();
    if (zoom) qp.setQueryParam("zoom", zoom.toString());
  }

  // get/set center
  let urlLat: any = qp.fetchQueryParam("lat");
  let urlLon: any = qp.fetchQueryParam("lon");
  if (urlLat !== undefined && urlLon !== undefined) {
    map.getView().setCenter([urlLat, urlLon]);
  } else {
    const center = map.getView().getCenter();
    if (center) qp.setQueryParam("lat", center[0].toString());
    if (center) qp.setQueryParam("lon", center[1].toString());
  }
}


const defineMapStyles = () => {
  evaluationStyle = function(feature: FeatureLike) {

    const defaultForestStyle = new Style({
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0)',
      }),
      stroke: new Stroke({
            color: '#656565FF',
            width: 4,
          }),
    });

    let evalClass = feature.get('class');
    let user = feature.get('user');
    let strokeColor = evalClass === 'Informal built-up' && user === sub.value ? 'rgba(255,255,0,0.8)' :
        evalClass === 'Informal built-up' && user !== sub.value  ? 'rgba(255,255,0,0.6)' :
            evalClass === 'Formal built-up' && user === sub.value ? 'rgba(255,0,0,0.8)' :
                evalClass === 'Formal built-up' && user !== sub.value ? 'rgba(255,0,0,0.5)' :
                    evalClass === 'Non-built-up' && user === sub.value ? 'rgb(89,172,3)' :
                        evalClass === 'Non-built-up' && user !== sub.value  ? 'rgb(89,172,3,0.6)' : 'rgb(101,101,101)';


    let fillColor = evalClass === 'Informal built-up' && user === sub.value ? 'rgba(255,255,0,0.0)' :
        evalClass === 'Informal built-up' && user !== sub.value  ? 'rgba(255,255,0,0.3)' :
            evalClass === 'Formal built-up' && user === sub.value ? 'rgba(255,0,0,0.0)' :
                evalClass === 'Formal built-up' && user !== sub.value ? 'rgba(255,0,0,0.3)' :
                    evalClass === 'Non-built-up' && user === sub.value ? 'rgb(89,172,3, 0)' :
                        evalClass === 'Non-built-up' && user !== sub.value  ? 'rgb(89,172,3,0.3)' : 'rgb(101,101,101)';

    // @ts-ignore
    defaultForestStyle.getStroke().setColor(strokeColor);
    // @ts-ignore
    defaultForestStyle.getFill().setColor(fillColor);
    return defaultForestStyle;
  };


  wfsSelectStyle = [
      new Style({
        stroke: new Stroke({
          color: '#3ba9e4',
          width: 5,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)',
        })
      }),
    new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: '#3ba9e4',
        }),
        stroke: new Stroke({
          color: 'white',
          width: 2
        })
      }),
      geometry: function (feature) {
        // @ts-ignore
        const coordinates = feature.getGeometry().getCoordinates()[0];
        return new MultiPoint(coordinates);
      },
    })
  ];

  wfsCreateStyle = [
    new Style({
      stroke: new Stroke({
        color: '#3ba9e4',
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0)',
      })
    }),
    new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: '#3ba9e4',
        }),
        stroke: new Stroke({
          color: 'white',
          width: 2
        })
      }),
    })
  ];
}


const imageLoader = (image: any, src: any) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.open('GET', src);
  // Uncomment to pass authentication header
  xhr.setRequestHeader('Authorization', useMainStore().basicAuth);
  xhr.onload = function() {
    const url = URL.createObjectURL(xhr.response);
    const img = image.getImage();
    img.addEventListener('load', function() {
      URL.revokeObjectURL(url);
    });
    img.src = url;
  };
  xhr.send();
}


watch(deleteSuccessful, () => {

  if (editingMode.value === 'delete') {
    enableReset.value = deleteSuccessful.value;
  }
})


watch(createSuccessful, () => {

  if (createSuccessful.value === false ) return;

  useMapStore().removeInteraction(createInteraction);
  useMapStore().map.getViewport().style.cursor = "pointer";

  modifyInteraction = new Modify({
    source: drawSource,
    style: evaluationStyle
  });
  useMapStore().addInteraction(modifyInteraction);

  modifyInteraction.on('modifyend', () => {
    let newTempFeature = drawSource.getFeatures()[0];

    if (newTempFeature) {

      // check for intersection
      const coordinates = newTempFeature.clone().getGeometry().getCoordinates()[0];
      const poly = turf.polygon(coordinates);

      if (turf.kinks(poly).features.length > 0) {

        // show warning of intersected polygon and delete it afterwards
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Polygon must not intersect itself and cannot be saved',
          life: 3000
        });
        featureIsIntersected.value = true;
        setTimeout(() => {
          // resetEdits.value = true;
        }, 3000);

      } else {

        featureIsIntersected.value = false;
        let polygonArea = turf.area(poly)
        let polygonAreaFormatted = (polygonArea / 1000000).toFixed(2);
        toast.add({
          severity: 'info',
          summary: 'Info',
          detail: `Polygon has an area of ${polygonAreaFormatted} km²`,
          life: 3000
        });

        // register polygon
        newFeature.value = newTempFeature;
        let newFeatureGeometry = newTempFeature.clone().getGeometry();
        if (newFeatureGeometry) {
          newGeometry = newFeatureGeometry;
        }
      }
    }
  })
});


watch(updateEvaluation, () => {
  const currentEditing = useFeatureStore().editingMode;
  if (updateEvaluation.value) {
    useFeatureStore().editingMode = 'pan';
    setTimeout(() => {
      useFeatureStore().editingMode = currentEditing;
    }, 100)
  }
  updateEvaluation.value = false;
});


watch(() => useFeatureStore().editingMode, () => {

  prepareNewEditingMode();

  if (useFeatureStore().editingMode === 'create') {
    useMapStore().map.getViewport().style.cursor = "crosshair";
    useMapStore().map.addLayer(drawLayer);
    createFeature();
  } else if (useFeatureStore().editingMode === 'update') {
    useMapStore().map.getViewport().style.cursor = "pointer";
    updateFeature();
  } else if (useFeatureStore().editingMode === 'delete') {
    useMapStore().map.getViewport().style.cursor = "pointer";
    deleteFeature();
  } else if (useFeatureStore().editingMode === 'pan') {
    useMapStore().map.getViewport().style.cursor = "grab";
    useMapStore().addInteraction(dragPanInteraction);
  }

  useFeatureStore().currentCommand = (useFeatureStore().commands as any)[useFeatureStore().editingMode].general;
});


watch(() => saveEdits.value, () => {
  if (saveEdits.value) {
    if (editingMode.value === 'create') {
      insertWFSTransact();
    }
    if (editingMode.value === 'update') {
      if (newCoordinates) {
        updateWFSTransact(newCoordinates, oldFeature.value.getId());
      }
    }
    if (editingMode.value === 'delete') {
      deleteWFSTransact(fid);
    }
  }
  saveEdits.value = false;
});


watch(() => resetEdits.value, () => {

  if (resetEdits.value) {
    if (editingMode.value === 'create') {
      newFeature.value = undefined;
      drawSource.clear();
      evalClass.value = '';
      comment.value = '';
      // this workaround is needed when a second polygon was drawn without saving the first one
      useFeatureStore().editingMode = 'pan';
      setTimeout(() => {
        useFeatureStore().editingMode = 'create';
      }, 100)
      createSuccessful.value = false;
    }
    if (editingMode.value === 'update') {
      useFeatureStore().resetCategories(true, true);
      resetAll();
    }
    if (editingMode.value === 'delete') {
      useFeatureStore().newCategories = _.cloneDeep(useFeatureStore().oldCategories);
      if (oldFeature.value) {
        let newFeatureGeometry = oldFeature.value.clone().getGeometry();
        if (newFeatureGeometry) {
          newGeometry = newFeatureGeometry;
          insertWFSTransact();
        }
      }
      deleteInteraction.getFeatures().clear();
    }
  }
  resetEdits.value = false;
});


watch(() => isAuthenticated.value, () => {

  if (isAuthenticated.value) {
    useDatasetLayerStore().getAuthorizedDatasets();
    useMapStore().setAuthorizedLayersVisible();
    loadEvaluationLayer();
    initDrawLayer();
    setTimeout(() => {
      useMapStore().updateEvaluationLayer();
    }, 500);
  } else {
    useDatasetLayerStore().getUnauthorizedDatasets();
    useMapStore().removeLayer(evaluationLayer);
    useMapStore().setUnauthorizedLayersVisible();
  }
  useDatasetLayerStore().setMenuDatasetsVisible()
}, { immediate: true });
</script>


<style scoped >
body {
  background-color: #242423;
}

#map {
  width: auto;
  background-color: #242423;
  height: calc(100vh - 60px);
}

.map-button {
  z-index: 1;
  position: absolute;
  top: 70px;
  background-color: #2A2D2FFF;
  padding: 0.5rem;
  min-width: 2rem;
}

.map-button:hover {
  cursor: pointer;
}

.map-button:focus {
  background-color: #2A2D2FFF !important;
}

#btn-globe {
  right: 15px;
}

#btn-layers {
  right: 55px;
}

#btn-geosearch {
  right: 95px;
}

#btn-stats {
  right: 135px;
}
</style>