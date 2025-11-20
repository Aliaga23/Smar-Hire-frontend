declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface CellDef {
    content?: string | number
    colSpan?: number
    rowSpan?: number
    styles?: Partial<Styles>
  }

  interface ColumnInput {
    header?: string
    dataKey?: string
  }

  interface Styles {
    font?: 'helvetica' | 'times' | 'courier'
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic'
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden'
    fillColor?: number | [number, number, number]
    textColor?: number | [number, number, number]
    cellPadding?: number
    fontSize?: number
    cellWidth?: 'auto' | 'wrap' | number
    minCellHeight?: number
    minCellWidth?: number
    halign?: 'left' | 'center' | 'right'
    valign?: 'top' | 'middle' | 'bottom'
    lineColor?: number | [number, number, number]
    lineWidth?: number
  }

  interface Config {
    head?: CellDef[][] | string[][]
    body?: CellDef[][] | any[][]
    foot?: CellDef[][] | string[][]
    startY?: number
    margin?: number
    pageBreak?: 'auto' | 'avoid' | 'always'
    theme?: 'striped' | 'grid' | 'plain'
    styles?: Partial<Styles>
    headStyles?: Partial<Styles>
    bodyStyles?: Partial<Styles>
    footStyles?: Partial<Styles>
    alternateRowStyles?: Partial<Styles>
    columnStyles?: { [key: string]: Partial<Styles> }
    didDrawPage?: (data: any) => void
    columns?: ColumnInput[]
  }

  export default function autoTable(doc: jsPDF, config: Config): jsPDF
}
