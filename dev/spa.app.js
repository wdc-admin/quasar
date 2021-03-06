import '../src/ie-compat/ie'

import Vue from 'vue'

// "Everything" bit is just a hack.
// Don't use it in your apps.
import Quasar, * as Everything from 'quasar'

import App from './App'
import { createRouter } from './router'

import 'quasar-css'

if (process.env.THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
import 'quasar-extras/ionicons'
import 'quasar-extras/fontawesome'
import 'quasar-extras/mdi'
import 'quasar-extras/animate'

// import iconSet from '../icons/fontawesome'

Vue.use(Quasar, {
  components: Everything,
  directives: Everything,
  plugins: Everything,
  config: {
    /*
    brand: {
      primary: '#e46262'
    }
    */
  }
  // iconSet
})

/* eslint-disable no-new */
new Vue({
  el: '#q-app',
  router: createRouter(),
  render: h => h(App)
})
