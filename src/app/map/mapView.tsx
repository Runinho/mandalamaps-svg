import {LayerStyle} from "@/app/layerStyle";
import {MappedNode, ResolvedWays, TagCountCounter, Way} from "@/app/map/mapData";
import {Layer} from "@/app/map/layer";
import {bool, string} from "prop-types";
import React, {useRef, useState} from "react";
import {Tile} from "@/app/map/tile";
import {Matrix3} from "@/app/math/Matrix3";
import {TileId} from "@/app/map/tileId";
import {mercator, mercator_inv} from "@/overpass/projection";
import {Position} from "@/app/map/resolveRefs";
import {MapConfig} from "@/app/config/MapConfig";

class Pos{
  x: number
  y: number

  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }

  minus(other: Pos){
    return new Pos(this.x - other.x, this.y - other.y)
  }

  divConstant(c: number){
    return new Pos(this.x / c, this.y / c)
  }
}

export interface MapProps {
  layerStyles: {[id: string]:LayerStyle},
  updateTagCount: (tileId: TileId, counter: TagCountCounter) => void,
  position: Position,
  mapConfig: MapConfig,
}

export function MapView({layerStyles, updateTagCount, position, mapConfig}: MapProps) {
  const viewSizeX = 500;
  const viewSizeY = 500;
  const tile = TileId.getTile(position); // someplace in Paris
  //origin of the map. larger values cause artifacts in the rendering.
  const origin = mercator({lat: tile.north(), lon:tile.west()});

  const [transform, setTransfrom] = useState<Matrix3>(new Matrix3().makeTranslation(0, viewSizeY/2))
  const [mouseDown, setMouseDown] = useState<boolean | {startPos: Pos, startTransform:Matrix3}>(false)
  // tiles that should be load
  const [loadTiles, setLoadTiles] = useState<string[]>([tile.asString()])

  const [mouseTileId, setMouseTileId] = useState<TileId>(tile);

  const svgRef = useRef(null);

  const toSvgCoords = (e: React.MouseEvent) => {
    var bounds = svgRef.current.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    // make them relative to the svg drawing size
    x = (x/bounds.width) * viewSizeX
    y = (y/bounds.height) * viewSizeY
    return new Pos(x, y);
  }
  const movementToSvgCoords = (e: React.MouseEvent) => {
    var bounds = svgRef.current.getBoundingClientRect();
    var x = e.movementX;
    var y = e.movementY;
    // make them relative to the svg drawing size
    x = (x/bounds.width) * viewSizeX
    y = (y/bounds.height) * viewSizeY
    return new Pos(x, y);
  }

  // map coordinate of the top-left corner
  const tx = transform.elements[7]/transform.elements[0];
  const ty = transform.elements[6]/transform.elements[4];
  // shift with map coordinate of the current orign
  const viewOriginPos = origin.clone().minus(new MappedNode(tx, ty))

  const getMouseTileId = (e: React.MouseEvent) => {
    const mousePos = toSvgCoords(e);
    const mouseCoordinate = new MappedNode(viewOriginPos.lat + (mousePos.y - viewSizeY)/transform.elements[4],
      viewOriginPos.lon + (mousePos.x - viewSizeX)/transform.elements[0]);
    return getTileAt(mouseCoordinate);
  }

  const handleWheelZoom = (e: React.WheelEvent) => {
    const mousePos = toSvgCoords(e);
    setTransfrom((oldTransform:Matrix3) => {
      let newTransform = oldTransform.translate(-mousePos.x, -mousePos.y)
      newTransform = oldTransform.scaleSingle(1 - (e.deltaY/1000))
      newTransform = oldTransform.translate(+mousePos.x, +mousePos.y).clone()
      return newTransform
    });
  }

  const getTileAt = (pos: Position) => {
    // pos is in view coordinate space.
    // map to gps coordinate
    const viewOriginCoords = mercator_inv(pos);
    // get tileID
    return TileId.getTile(viewOriginCoords)
  }

  const handleMouseDown = (e)=>{
    setMouseDown(() => {
      return {startPos: toSvgCoords(e), startTransform:transform.clone()}
    })
  }
  const handleMouseUp = (e) =>{
    setMouseDown((old) => {
      if(old !== false){
        const startPos = old.startPos;
        const endPos = toSvgCoords(e);
        const drag_distance = Math.sqrt((startPos.x - endPos.x)**2 + (startPos.y - endPos.y)**2);
        console.log("drag distance:", drag_distance)
        if(drag_distance < 5){
          const selectedTileId = getMouseTileId(e);
          setLoadTiles((old) => [...old, selectedTileId.asString()]);
        }
      }

      return false
    })
  }
  const tile_right = new TileId(tile.latId, tile.lonId+1);

  let tileIds: TileId[] = []
  // iterate over the tiles
  // get tileId for top-left corner
  const viewOriginTileId = getTileAt(viewOriginPos);

  // last one; get tileId for top-right corner
  // use scale and svg view size to calculate bottom -right
  const viewEndPos = viewOriginPos
    .plus(new MappedNode(viewSizeX/transform.elements[0],
                         viewSizeY/transform.elements[4]))
  const viewEndTileId = getTileAt(viewEndPos)

  const handleMouseMove = (e: React.MouseEvent) => {
    // convert into the correct corrds
    // check if mouse down
    if(mouseDown !== false){
      // translate the last movement
      setTransfrom((oldTransform) => {
        const newPos = toSvgCoords(e)
        const startPos = mouseDown.startPos;
        const startTransform = mouseDown.startTransform;
        const movement = newPos.minus(startPos);
        const newTransform = startTransform.clone().translate(movement.x, movement.y)
        return newTransform
      });
    }


    // set handle mouse down. Update highlighted MouseTileId
    setMouseTileId((oldTileId) => {
      const newTileId = getMouseTileId(e)
      return newTileId;
    })
  }

  let max_elements = 1000;
  // iter for latitude Ids
  for (let latId = viewOriginTileId.latId; latId >= viewEndTileId.latId; latId--) {
    // iter over longitude Ids
    for (let lonId = viewOriginTileId.lonId; lonId <= viewEndTileId.lonId; lonId++) {
      max_elements--;
      if(max_elements > 0){
        tileIds.push(new TileId(latId, lonId));
      } else {
        break;
      }
    }
  }

  let tiles = tileIds.map((t) =>
    <Tile key={t.asString()}
          load={loadTiles.includes(t.asString())} // check if we should load the data for that tile.
          highlight={t.equals(mouseTileId)}
          updateTagCount={updateTagCount}
          tileId={t}
          layerStyles={layerStyles}
          origin={origin}
          mapConfig={mapConfig}
    />
  )


  return <svg ref={svgRef} viewBox={`0 0 ${viewSizeX} ${viewSizeY}`} id="emoji" xmlns="http://www.w3.org/2000/svg" fill="#000000" width="100%"
    onWheel={handleWheelZoom} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
    {/*<g transform={`translate(${mousePos.x}, ${mousePos.y})`}>*/}
    {/*  /!*<rect x="-10" y="-10"width="20" height="20" />*!/*/}
    {/*</g>*/}
    <g transform={transform.toSvgTransform()}>
      {/*<g transform={transform.toSvgTransform()}>*/}
      {/*  <rect x="-10" y="-10" width="20" height="20" fill="blue"/>*/}
      {/*</g>*/}
      {tiles}
      {/*<Tile load={true} updateTagCount={updateTagCount} tileId={tile} layerStyles={layerStyles} origin={origin}/>*/}
      {/*<Tile load={true} updateTagCount={updateTagCount} tileId={tile_right} layerStyles={layerStyles} origin={origin}/>*/}
      {/*<Tile preload={false} highlight={true} updateTagCount={updateTagCount} tileId={mouseTileId} layerStyles={layerStyles} origin={origin}/>*/}
      {/*<Tile preload={false} updateTagCount={updateTagCount} tileId={viewOriginTileId} layerStyles={layerStyles} origin={origin}/>*/}
      {/*<Tile preload={false} updateTagCount={updateTagCount} tileId={viewEndTileId} layerStyles={layerStyles} origin={origin}/>*/}
    </g>
  </svg>;
}