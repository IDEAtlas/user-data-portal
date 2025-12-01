import { defineStore } from 'pinia';
import { ref } from "vue";


export const useFeatureStore = defineStore('featureStore',
  () => {
    const oldFeature = ref();
    const newFeature = ref();
    const city = ref('Others');
    const country = ref('World');
    const label = ref('world');
    const evalClass = ref('');
    let oldCategories = ref([
      { name: "Housing conditions", column: "housing", key: "A", checked: false },
      { name: "Environment & climate", column: "environment", key: "B", checked: false },
      { name: "Infrastructure & services", column: "infrastructure", key: "C", checked: false },
      { name: "Social & security", column: "social", key: "D", checked: false },
      { name: "Settlement layout & density", column: "settlement", key: "E", checked: false }
    ]);
    const newCategories = ref([
      { name: "Housing conditions", column: "housing", key: "A", checked: false },
      { name: "Environment & climate", column: "environment", key: "B", checked: false },
      { name: "Infrastructure & services", column: "infrastructure", key: "C", checked: false },
      { name: "Social & security", column: "social", key: "D", checked: false },
      { name: "Settlement layout & density", column: "settlement", key: "E", checked: false }
    ]);
    const comment = ref('');
    const featureIsIntersected = ref(false);
    const editingMode = ref('pan');
    const saveEdits = ref(false);
    const resetEdits = ref(false);
    const enableSaveEdits = ref(false);
    const enableReset = ref(false);
    const enableDelete = ref(false);
    const updateGeometry = ref(false);
    const updateEvalClass = ref(false);
    const updateAttribute = ref(false);
    const updateComment = ref(false);
    const updateEvaluation = ref(false);

    const commands = ref( {
      "create": {
        general: 'Click into the map to start drawing a polygon.',
        step1: 'Add more vertices. Double-click to close polygon.',
        step2: 'Set required class.',
        step3: 'Define further attributes. Click "Save" to save polygon permanently or "Clear" to destroy it.'
      },
      "update": {
        general: 'Select a polygon. Inspect and edit attributes and geometry.',
        step1: 'Add vertices by clicking on the polygon line, move or delete vertices (ALT + click). Change attributes.',
        step2: 'Click "Save" to confirm changes or "Undo" to reset changes'
      },
      "delete": {
        general: 'Select a polygon.',
        step1: 'Confirm with "Delete" to destroy polygon.',
        step2: 'Reset with the "Undo" button or select another polygon to delete.'
      },
      "pan": {
        general: 'No editing in pan mode'
      }
    });

    const currentCommand = ref(commands.value.pan.general);

    const resetCategories = (resetOldCategories: boolean, resetNewCategories: boolean) => {
      if (resetOldCategories)
        oldCategories.value =  [
          { name: "Housing conditions", column: "housing", key: "A", checked: false },
          { name: "Environment & climate", column: "environment", key: "B", checked: false },
          { name: "Infrastructure & services", column: "infrastructure", key: "C", checked: false },
          { name: "Social & security", column: "social", key: "D", checked: false },
          { name: "Settlement layout & density", column: "settlement", key: "E", checked: false }
        ];

      if (resetNewCategories)
      newCategories.value =  [
        { name: "Housing conditions", column: "housing", key: "A", checked: false },
        { name: "Environment & climate", column: "environment", key: "B", checked: false },
        { name: "Infrastructure & services", column: "infrastructure", key: "C", checked: false },
        { name: "Social & security", column: "social", key: "D", checked: false },
        { name: "Settlement layout & density", column: "settlement", key: "E", checked: false }
      ];
    }
 
  return {
    oldFeature,
    newFeature,
    city,
    country,
    label,
    evalClass,
    oldCategories,
    newCategories,
    comment,
    featureIsIntersected,
    editingMode,
    saveEdits,
    resetEdits,
    enableSaveEdits,
    enableReset,
    enableDelete,
    commands,
    currentCommand,
    updateGeometry,
    updateEvalClass,
    updateAttribute,
    updateComment,
    updateEvaluation,
    resetCategories
  }
})
