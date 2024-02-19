import {
  CreateTagCountCounter, MappedNode,
  OSMElement,
  ResolvedWays,
  TagCount,
  TagCountCounter,
  TaggedWays,
  Way,
  Ways
} from "@/app/map/mapData";
import {DefaultDict} from "@/app/defaultdict";
import {mercator} from "@/overpass/projection";

export interface Position {
  lat: number;
  lon: number;
}


export function resolveRefs(data: { data: {elements: OSMElement[]}; offset: { lon: number; lat: number } }, origin: MappedNode): ResolvedWays {
  /*** convert the referenced nodes to lat, long Positions.
   data: raw json data from the overpass api.
   */
  const startTime = new Date();

  // save the location of the node
  let node: { [code: number]: Position } = [];

  // save the waypoints we have to draw (with the mapped positions of the nodes)
  let ways: Ways = {};

  // projection properties
  const offset = data["offset"];

  // load config; and color stuff...
  //TODO: count apperances
  // Filter of tags
  //TODO: maybe the user should be able to adjust these
  const interesting_tags = ["highway", "landuse", "railway", "waterway", "natural", "building", "aeroway", "leisure"]
  // init ways
  for (const tag of interesting_tags) {
    ways[tag] = new TaggedWays(tag);
  }
  let tagCount:TagCountCounter = CreateTagCountCounter();

  const elements: OSMElement[] =  data["data"]["elements"]
  const projectedOffset = mercator(offset)
  for (const elm of elements) {
    if (elm["type"] === "node") {
      // might want to map coords here
      // might convert this to the coordstream we also need to render in svg?
      const mapped = mercator(elm)
      node[elm["id"]] = mapped.minus(origin); //.minus(projectedOffset);
    }
    if (elm["type"] === "way") {
      if (elm["tags"]) {
        //TODO: filter after tag value
        const target_tags = interesting_tags.filter((tag) => !!elm["tags"][tag])
        const mapped_nodes = elm["nodes"].map((id) => node[id]);
        const way = new Way(mapped_nodes, elm["tags"], elm["id"]);
        for (const targetTag of target_tags) {
          ways[targetTag].addWay(way);
          const tagKeyCounts = tagCount.get(targetTag);
          // increase value
          tagKeyCounts.set(way.tags[targetTag],
            tagKeyCounts.get(way.tags[targetTag]) + 1);
        }
      }
    }
  }
  console.log("parsing took:", (new Date()) - startTime, "ms")

  console.log("ways", ways, tagCount);
  return new ResolvedWays(ways, tagCount);
}