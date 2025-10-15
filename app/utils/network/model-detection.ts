import {
  VISION_MODEL_REGEXES,
  EXCLUDE_VISION_MODEL_REGEXES,
} from "../../constant";
import { useAccessStore } from "../../store";

export function isVisionModel(model: string) {
  const visionModels = useAccessStore.getState().visionModels;
  const envVisionModels = visionModels?.split(",").map((m) => m.trim());
  if (envVisionModels?.includes(model)) {
    return true;
  }
  return (
    !EXCLUDE_VISION_MODEL_REGEXES.some((regex) => regex.test(model)) &&
    VISION_MODEL_REGEXES.some((regex) => regex.test(model))
  );
}

export function isDalle3(model: string) {
  return "dall-e-3" === model;
}
