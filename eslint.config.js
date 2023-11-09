import { vue, typescript, imports } from '@antfu/eslint-config'

export default [
    ...vue(),
    ...typescript(),
    ...imports()
]