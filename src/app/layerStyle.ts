import {v4 as uuidv4} from 'uuid';


export type LayerStyleEnabled = { [tagKey: string]: string[] | boolean };
export class LayerStyle {
  id: number; // id this layer is referenced by (enables faster reordering etc.)
  name: string; // name of the layer; choosen by the user
  fill: boolean;
  color: string; // should be a hex color
  stroke: string; // should be a hex color
  width: number;
  enabled: LayerStyleEnabled;


  constructor(name: string, fill: boolean, color: string, stroke: string, width: number) {
    this.id = uuidv4();
    console.log(this.id);
    this.name = name;
    this.fill = fill;
    this.color = color;
    this.stroke = stroke;
    this.width = width;
    this.enabled = {};
  }
}