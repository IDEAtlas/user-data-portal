export default interface Layer {
  id: number;
  name: string;
  slugName: string;
  headerName: string;
  imgPath: string;
  description: string;
  attributionHeader: string;
  attribution: string;
  url: string;
  params: object;
  type: string;
  order: number;
  zIndex: number;
  size: string;
  minZoom: number;
  visible: boolean;
  opacity: number | 100;
  loaded: boolean;
  restricted: boolean;
  legend: string;
  legendType: string;
}