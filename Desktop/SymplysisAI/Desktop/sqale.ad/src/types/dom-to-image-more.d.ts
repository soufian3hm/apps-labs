declare module 'dom-to-image-more' {
  export interface Options {
    quality?: number
    width?: number
    height?: number
    style?: {
      [key: string]: string | number
    }
    bgcolor?: string
    cacheBust?: boolean
    filter?: (node: Node) => boolean
    imagePlaceholder?: string
    skipFonts?: boolean
    preferredFontFormat?: string
  }

  export function toPng(node: Node, options?: Options): Promise<string>
  export function toJpeg(node: Node, options?: Options): Promise<string>
  export function toBlob(node: Node, options?: Options): Promise<Blob>
  export function toPixelData(node: Node, options?: Options): Promise<Uint8ClampedArray>
  export function toSvg(node: Node, options?: Options): Promise<string>

  const domtoimage: {
    toPng: typeof toPng
    toJpeg: typeof toJpeg
    toBlob: typeof toBlob
    toPixelData: typeof toPixelData
    toSvg: typeof toSvg
  }

  export default domtoimage
}
