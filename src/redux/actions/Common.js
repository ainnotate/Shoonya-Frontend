import C from "../constants";

export const setPlayer = (data) => {
  return {
    type: C.PLAYER,
    payload: data,
  };
};

export const setSubtitles = (data, type) => {
  return {
    type: type,
    payload: data,
  };
};

export const setCurrentIndex = (index, type) => {
  return {
    type,
    payload: index,
  };
};