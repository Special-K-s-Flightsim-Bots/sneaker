import GermanyCWAirBases from "../../data/airbases/germanycw.json";
import { convertRawAirBaseData, DCSMap } from "./DCSMap";

export const GermanyCW: DCSMap = {
  name: "GermanyCW",
  center: [52, 10.5],
  magDec: -0.5,
  airports: convertRawAirBaseData(GermanyCWAirBases),
};
