export const TILE_SIZE = 360/(80000*2) // roughly 250m
export class TileId{
  latId:number
  lonId:number

  constructor(latId:number, lonId:number) {
    this.latId = latId;
    this.lonId = lonId;
  }

  public static getTile(pos: {lat: number, lon:number}){
    const posLat = Math.floor(pos.lat/TILE_SIZE)
    const posLon = Math.floor(pos.lon/TILE_SIZE)
    return new TileId(posLat, posLon)
  }

  // get GPS coordinates.
  north(){
    return this.latId * TILE_SIZE
  }
  south(){
    return (this.latId + 1)  * TILE_SIZE
  }
  east(){
    return (this.lonId + 1) * TILE_SIZE
  }
  west(){
    return this.lonId * TILE_SIZE
  }

  asString(){
    return `${this.latId}:${this.lonId}`
  }

  equals(other: TileId):boolean {
    return this.latId == other.latId && this.lonId == other.lonId;
  }
}