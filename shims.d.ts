declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  
  const component: DefineComponent<{}, {}, any>
  export default component
}


declare module 'vue-prism-component' {
  import type { ComponentOptions } from 'vue'

  const component: ComponentOptions
  export default component
}
declare module 'vue-shepherd';
