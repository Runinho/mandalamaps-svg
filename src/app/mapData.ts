
// used internally
import {DefaultDict} from "@/app/defaultdict";

export type TagCount = DefaultDict<DefaultDict<number>>;

type Tags = {
  [key: string]: string;
}

export class MappedNode{
  lat: number;
  lon: number;

  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
  }

  minus(other: MappedNode) {
    this.lat -= other.lat
    this.lon -= other.lon
    return this
  }
}

export class Way{
  nodes: MappedNode[];
  tags: Tags;
  id: number

  constructor(nodes: MappedNode[], tags: {[tag: string]: string}, id:number) {
    this.nodes = nodes;
    this.tags = tags;
    this.id = id;
  }
}


export class TaggedWays {
  /*** Class storing all the way information for one tag key. E.g: building
   * idea is to have a easy to acess mapping for each value in the tags.
   * This is achieved by storing a list of wayId's for each Value a tag can have.
   * Combined with a dict with all tag Keys we have something linke
   * ways[tagKey].tagValue2id[tagValue] to get the list of all wayIds. with that tag.
   */
  tagKey: string; // e.g.: highway, building
  tagValue2id: DefaultDict<number[]>; // mapping from tag values to a list of ids
  ways: { [id: number]: Way }; // list of Way objects accessible by id

  constructor(tagKey: string) {
    this.tagKey = tagKey;
    this.tagValue2id = new DefaultDict<number[]>(() => []);
    this.ways = {};
  }

  addWay(way:Way){
    this.ways[way.id] = way
    const tagValue = way.tags[this.tagKey]
    this.tagValue2id.get(tagValue).push(way.id)
  }
}
export type Ways = { [tagKey: string]: TaggedWays };

export class ResolvedWays {
  ways: Ways;
  tagCounts: TagCount;

  constructor(ways: Ways, tagCounts: TagCount) {
    this.ways = ways;
    this.tagCounts = tagCounts;
  }
}

// OSM Types
interface OSMWay {
  type: "way";
  id: number;
  nodes: number[];
  tags: {
    [key: string]: string;
  };
}

interface OSMNode {
  type: "node";
  id: number;
  lat: number;
  lon: number;
}

export type OSMElement = OSMWay | OSMNode;
