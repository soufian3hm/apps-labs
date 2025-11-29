declare module 'react-world-flags' {
  import { FC, CSSProperties } from 'react'

  export interface FlagProps {
    code: string
    fallback?: React.ReactNode
    height?: string | number
    width?: string | number
    style?: CSSProperties
    className?: string
    [key: string]: any
  }

  const Flag: FC<FlagProps>
  export default Flag
}

