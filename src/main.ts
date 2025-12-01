import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import App from './App.vue'
import { createPinia } from "pinia";
import keycloak from "@/components/Authentication/keycloak.ts";


import 'primeflex/primeflex.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import '@/assets/styles/main.css';


import StyleClass from 'primevue/styleclass';
import Ripple from 'primevue/ripple';
import Tooltip from 'primevue/tooltip';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Button from "primevue/button";
import Menu from 'primevue/menu';
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Slider from "primevue/slider";
import AutoComplete from "primevue/autocomplete";
import Checkbox from "primevue/checkbox";
import Divider from 'primevue/divider';
import ProgressBar from 'primevue/progressbar';


const app = createApp(App);

app.use(PrimeVue, { ripple: true });
app.use(createPinia())
app.use(ToastService);


app.use(keycloak, {
  url: 'https://authorize.geoville.com/',
  realm: "ideatlas",
  clientId: "frontend-app",
});


app.component('Button', Button);
app.component('Menu', Menu);
app.component('Dialog', Dialog);
app.component('Textarea', Textarea);
app.component('Checkbox', Checkbox);
app.component('Dropdown', Dropdown);
app.component('Slider', Slider);
app.component('Toast', Toast);
app.component('AutoComplete', AutoComplete);
app.component('Divider', Divider);
app.component('ProgressBar', ProgressBar);

app.directive('styleclass', StyleClass);
app.directive('ripple', Ripple);
app.directive('tooltip', Tooltip);


app.mount("#app");

