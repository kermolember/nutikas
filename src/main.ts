import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import App from './App.vue';
import { router } from './app/router';
import { useAuthStore } from './app/stores/auth.store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

useAuthStore().initialize();

app.mount('#app');
