import C from "../../constants";

const initialState = {
  player: null,
  subtitles: [],
  currentIndex: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
   
    case C.PLAYER: {
      let result = state;
      result.player = action.payload;
      return result;
    }

    case C.SUBTITLES: {
      let result = state;
      result.subtitles = action.payload;
      return result;
    }

    case C.CURRENT_INDEX:
      return {
        ...state,
        currentIndex: action.payload,
      };

    default:
      return {
        ...state,
      };
  }
};

export default reducer;
