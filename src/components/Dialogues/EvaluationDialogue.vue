<script setup lang="ts">

import { useFeatureStore } from "@/stores/featureStore.ts";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useKeycloak } from "@/components/Authentication/keycloak.ts";
import { useMapStore } from "@/stores/mapStore.ts";

import * as _ from 'lodash'


const { isAuthenticated } = useKeycloak();

const { oldFeature, newFeature, city, country, evalClass, comment, featureIsIntersected, saveEdits,
  resetEdits, editingMode, enableSaveEdits, enableReset, updateGeometry, updateEvalClass, updateAttribute, updateComment } = storeToRefs(useFeatureStore());

const visible = ref(false);
const maxDialogue = ref(true);

const evaluationClasses = ref([
  'Informal built-up',
  'Formal built-up',
  'Non-built-up'
]);


const categoriesInactive = computed(() => {
  return editingMode.value === 'pan' || editingMode.value === 'delete' || (editingMode.value === 'update' && useFeatureStore().oldFeature === undefined)
      || useFeatureStore().evalClass !== 'Informal built-up'
});


const selectedCategories = ref(_.map(_.filter(useFeatureStore().newCategories, (item) => item.checked), 'name'));


const updateCategories = (columnName: string) => {

  let selectedItem = _.find(useFeatureStore().newCategories,  (item) => { return item.column === columnName });
  if (selectedItem) {
    selectedItem.checked = !selectedItem.checked;
  }
}


const resetAll = () => {

  if (editingMode.value === 'create') {
    newFeature.value = undefined;
    evalClass.value = '';
    comment.value = '';
  }
  if (editingMode.value === 'update') {
    useFeatureStore().resetCategories(true, true);
    oldFeature.value = undefined;
    newFeature.value = undefined;
    evalClass.value = '';
    comment.value = '';
    enableReset.value = false;
    enableSaveEdits.value = false;
    updateAttribute.value = false;
    updateGeometry.value = false;
    updateEvalClass.value = false;
    updateComment.value = false;
    useFeatureStore().currentCommand = useFeatureStore().commands.update.general;
  }
  if (editingMode.value === 'delete') {
    if (oldFeature.value) {
      evalClass.value = oldFeature.value.getProperties().class;
      comment.value = oldFeature.value.getProperties().comment;
    }
    enableReset.value = false;
  }
  resetEdits.value = true;
}


watch(() => newFeature.value, () => {
  if (editingMode.value === 'create') {
    enableSaveEdits.value = newFeature.value !== undefined && evalClass.value !== '';
    enableReset.value = newFeature.value !== undefined;
  }
});


watch(() => city.value, () => {
  visible.value = city.value !== '';
});


watch(() => evalClass.value, () => {
  if (editingMode.value === 'create') {
    if (evalClass.value !== '') {
      useFeatureStore().currentCommand = useFeatureStore().commands.create.step3;
    }

    enableSaveEdits.value = evalClass.value !== '' && newFeature.value !== undefined;
    enableReset.value = evalClass.value !== '';
  }

  if (editingMode.value === 'update') {
    updateEvalClass.value = false;
    if (newFeature.value !== undefined) {
      const newFeatureComment = newFeature.value.getProperties().class;
      if (newFeatureComment !== evalClass.value) {
        updateEvalClass.value = true;
      }
    }
  }

  if (evalClass.value !== 'Informal built-up') {
    useFeatureStore().resetCategories(false, true);
  }
});


watch(() => _.map(_.filter(useFeatureStore().newCategories, (item) => item.checked), 'name'), () => {
  selectedCategories.value = _.map(_.filter(useFeatureStore().newCategories, (item) => item.checked), 'name');
  updateAttribute.value = !_.isEqual(_.map(useFeatureStore().newCategories, 'checked'), _.map(useFeatureStore().oldCategories, 'checked'));
})


watch(() => comment.value, () => {
  if (editingMode.value === 'create') {
    enableReset.value = comment.value !== '';
  }
  if (editingMode.value === 'update') {
    updateComment.value = false;
    if (newFeature.value !== undefined) {
      const newFeatureComment = newFeature.value.getProperties().comment;
      if (newFeatureComment !== comment.value) {
        updateComment.value = true;
      }
    }
  }
});


watch(() => enableSaveEdits.value, () => {
  if (editingMode.value === 'update') {
    if (enableSaveEdits.value) {
      useFeatureStore().currentCommand = useFeatureStore().commands.update.step2;
    } else {
      useFeatureStore().currentCommand = useFeatureStore().commands.update.general;
    }
  }
})
</script>


<template>
  <Dialog
     :visible="isAuthenticated && city !== ''"
     minimize-icon="true"
     position="bottomleft"
     :closable="false"
     class="flex align-content-between w-24rem z-1"
     :min-y="56" >

    <!--   customized header   -->
    <template #header>
      <div class="flex flex-row align-items-center justify-content-between w-full">
        <div class="text-lg px-0 mt-2">{{ city }} – {{ country }}</div>
        <div>
          <Button class="bg-gray-800 h-3rem" v-tooltip.top="'Refresh evaluation layer'" @click="useMapStore().updateEvaluationLayer()">
            <img alt="logo" src="../../assets/icons/icon-sync.svg" style="width:16px;height:16px;"/>
          </Button>
          <Button class="bg-gray-800 h-3rem" v-if="maxDialogue" icon="pi pi-chevron-up" aria-label="Minimize dialogue" v-tooltip.top="'Minimize dialogue'" @click="maxDialogue = false"/>
          <Button class="bg-gray-800 h-3rem" v-if="!maxDialogue" icon="pi pi-chevron-down" aria-label="Maximize dialogue" v-tooltip.top="'Maximize dialogue'" @click="maxDialogue = true"/>
        </div>
      </div>
    </template>

    <!--   editing buttons  -->
    <div class="flex justify-content-between flex-wrap pt-3 p-1 editButtons ">
        <Button @click="editingMode = 'create'" v-tooltip.top="'Create Polygon'"
                :class="{ 'activeButton': editingMode === 'create'}">
          <img alt="logo" src="../../assets/icons/create-polygon.svg"/>
        </Button>
        <Button @click="editingMode = 'update'" v-tooltip.top="'Select & Edit Polygon'"
                :class="{ 'activeButton': editingMode === 'update'}">
          <img alt="logo" src="../../assets/icons/edit-polygon.svg"/>
        </Button>
        <Button @click="editingMode = 'delete'" v-tooltip.top="'Delete Polygon'"
                :class="{ 'activeButton': editingMode === 'delete'}">
          <img alt="logo" src="../../assets/icons/delete-polygon.svg"/>
        </Button>
        <Button @click="editingMode = 'pan'" v-tooltip.top="'Pan'"
                :class="{ 'activeButton': editingMode === 'pan'}">
          <img alt="logo" src="../../assets/icons/icon-pan.svg"/>
        </Button>
      </div>

    <div v-if="maxDialogue">
       <!--   evaluation classes   -->
      <div class="flex w-full pt-5 align-items-start justify-content-between">
        <span class="p-float-label">
          <Dropdown v-model="evalClass" :options="evaluationClasses" class="w-20rem" :aria-required="true"
                    :disabled="editingMode==='delete' || editingMode ==='pan' || (editingMode === 'update' && useFeatureStore().oldFeature === undefined)" />
          <label v-if="useFeatureStore().editingMode === 'create' && useFeatureStore().evalClass == ''">* Classes</label>
          <label v-if="useFeatureStore().editingMode !== 'create' || useFeatureStore().evalClass != ''">Classes</label>
        </span>
      </div>

      <!--   predefined attribute options   -->
      <div class="w-full px-1 my-4 ">
        <div v-if="categoriesInactive" class="text-sm text-gray-500 mb-2 mt-5">Select the relevant deprivation domains </div>
        <div v-else class="text-sm mb-2 mt-5">Select the relevant deprivation domains </div>
        <div v-for="category of useFeatureStore().newCategories" :key="category.key" class="flex align-items-center py-1">
          <Checkbox v-model="selectedCategories" :inputId="category.key" name="category" :value="category.name"
                    @change="updateCategories(category.column)"
                    :disabled="categoriesInactive"/>
          <label v-if="categoriesInactive" class="ml-4 text-gray-500" :for="category.key">{{ category.name }}</label>
          <label v-else class="ml-4" :for="category.key">{{ category.name }}</label>
        </div>
      </div>

      <!--   detailed description   -->
      <div class="pb-1 flex-column">
        <div class="p-2 text-sm">Please explain why you selected this area as formal or informal</div>
        <Textarea v-model="comment" rows="2" :autoresize="false" default="''"
                  autocomplete="off"
                  :disabled="editingMode==='delete' || editingMode ==='pan' || (editingMode === 'update' && useFeatureStore().oldFeature === undefined)"
        class="w-20rem px-3 ml-1 mr-0"/>
      </div>

      <!--   save / undo button   -->
      <div class="flex pt-3 justify-content-center gap-4">
        <Button v-if="useFeatureStore().editingMode === 'create'" icon="pi pi-save" label="Save" class="saveButton"
                @click="saveEdits=true" :disabled="!enableSaveEdits || featureIsIntersected" />
        <Button v-if="useFeatureStore().editingMode === 'create'" icon="pi pi-undo" label="Clear" class="undoButton"
                @click="resetAll()" :disabled="!enableReset" />

        <Button v-if="useFeatureStore().editingMode === 'update'" icon="pi pi-undo" label="Save" class="saveButton" @click="saveEdits=true"
                :disabled="featureIsIntersected || (!updateGeometry && !updateEvalClass && !updateAttribute && !updateComment)" />
        <Button v-if="useFeatureStore().editingMode === 'update'" icon="pi pi-undo" label="Undo" class="undoButton" @click="resetAll()"
                :disabled="(!updateGeometry && !updateEvalClass && !updateAttribute && !updateComment)" />

        <Button v-if="useFeatureStore().editingMode === 'delete'" icon="pi pi-save" label="Delete" class="saveButton"
                @click="saveEdits=true" :disabled="!enableSaveEdits" />
        <Button v-if="useFeatureStore().editingMode === 'delete'" icon="pi pi-undo" label="Undo" class="undoButton"
                @click="resetAll()" :disabled="!enableReset" />

        <Button v-if="useFeatureStore().editingMode === 'pan'" icon="pi pi-save" label="Save" :disabled="true" />
        <Button v-if="useFeatureStore().editingMode === 'pan'" icon="pi pi-undo" label="Undo" :disabled="true" />
      </div>
    </div>
  </Dialog>
</template>


<style scoped>
textarea.p-inputtext {
  resize: none;
}

.p-button {
  min-width: 2rem !important;
}

</style>


<style>
.p-dialog-title {
  color: white;
}

div.p-dialog-mask.p-dialog-bottomleft {
  z-index: 2 !important;
}

.p-dropdown-item.p-highlight {
  color: #726f6f !important;
}

label {
  color: #e5e3e3 !important;
}

.activeButton {
  background-color: #086698 !important;
}

.saveButton {
  background-color: #7db146 !important;
}

.undoButton {
  background-color: #e68728 !important;
}
</style>