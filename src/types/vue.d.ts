declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '/@lyri/*' {
  const value: any
  export default value
}

declare module '@lyri/*' {
  const value: any
  export default value
}