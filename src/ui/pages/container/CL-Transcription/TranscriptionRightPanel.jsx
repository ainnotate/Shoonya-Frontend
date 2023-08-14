import React, { useCallback, useEffect, useState, useRef, memo } from "react";
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addSubtitleBox,
  getSubtitleRangeTranscript,
  onMerge,
  onSplit,
  onSubtitleChange,
  onSubtitleDelete,
  timeChange,
  onUndoAction,
  onRedoAction,
  getSelectionStart,
  getTimings,
  getItemForDelete,
  MenuProps,
  assignSpeakerId,
  // getTagsList,
} from "../../../../utils/SubTitlesUtils";

//Styles
// import "../../../styles/scrollbarStyle.css";
import AudioTranscriptionLandingStyle from "../../../styles/AudioTranscriptionLandingStyle";


//Components
import {
  Box,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  Pagination,
} from "@mui/material";
// import {
//   ConfirmDialog,
//   CustomizedSnackbars,
//   TagsSuggestionList,
//   TimeBoxes,
// } from "common";
import ButtonComponent from "./ButtonComponent";
import TimeBoxes from "./TimeBoxes";
import APITransport from "../../../../redux/actions/apitransport/apitransport";
import GetAnnotationsTaskAPI from "../../../../redux/actions/CL-Transcription/GetAnnotationsTask";


// import SettingsButtonComponent from "./components/SettingsButtonComponent";

//APIs
import {
  setSubtitles,
} from "../../../../redux/actions/Common";
import C from "../../../../redux/constants";
import SettingsButtonComponent from "./SettingsButtonComponent";
import SaveTranscriptAPI from "../../../../redux/actions/CL-Transcription/SaveTranscript";
import CustomizedSnackbars from "../../component/common/Snackbar"
// import {
//   APITransport,
//   FetchTranscriptPayloadAPI,
//   SaveTranscriptAPI,
//   setSubtitles,
// } from "redux/actions";

const TranscriptionRightPanel = ({ currentIndex , AnnotationsTaskDetails }) => {
  const { taskId } = useParams();
  const classes = AudioTranscriptionLandingStyle();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const xl = useMediaQuery("(min-width:1800px)");

  // const taskData = useSelector((state) => state.getTaskDetails.data);
  const assignedOrgId = JSON.parse(localStorage.getItem("userData"))
    ?.organization?.id;
  const subtitles = useSelector((state) => state.commonReducer.subtitles);
  const player = useSelector((state) => state.commonReducer.player);
  const totalPages = useSelector((state) => state.commonReducer.totalPages);
  const currentPage = useSelector((state) => state.commonReducer.currentPage);
  const next = useSelector((state) => state.commonReducer.nextPage);
  const previous = useSelector((state) => state.commonReducer.previousPage);
  const completedCount = useSelector(
    (state) => state.commonReducer.completedCount
  );
  // const transcriptPayload = useSelector(
  //   (state) => state.getTranscriptPayload.data
  // );
  const limit = useSelector((state) => state.commonReducer.limit);
  // const videoDetails = useSelector((state) => state.getVideoDetails.data);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = AnnotationsTaskDetails[0]?.result?.slice(
    startIndex,
    endIndex
  );

  const [snackbar, setSnackbarInfo] = useState({
    open: false,
    message: "",
    variant: "success",
  });
  const [showPopOver, setShowPopOver] = useState(false);
  const [selectionStart, setSelectionStart] = useState();
  const [currentIndexToSplitTextBlock, setCurrentIndexToSplitTextBlock] =
    useState();
  const [enableTransliteration, setTransliteration] = useState(true);
  const [enableRTL_Typing, setRTL_Typing] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState("large");
  const [currentOffset, setCurrentOffset] = useState(1);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showSpeakerIdDropdown, setShowSpeakerIdDropdown] = useState([]);
  const [speakerIdList, setSpeakerIdList] = useState([]);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(0);
  const [tagSuggestionsAnchorEl, setTagSuggestionsAnchorEl] = useState(null);
  const [tagSuggestionList, setTagSuggestionList] = useState([]);
  const [textWithoutBackSlash, setTextWithoutBackSlash] = useState("");
  const [textAfterBackSlash, setTextAfterBackSlash] = useState("");
  const [enableTransliterationSuggestion, setEnableTransliterationSuggestion] =
    useState(true);

  // useEffect(() => {
  //   if (videoDetails.hasOwnProperty("video")) {
  //     const speakerList = videoDetails?.video?.speaker_info?.map((speaker) => {
  //       return speaker;
  //     });
  //     setSpeakerIdList(speakerList);
  //     setShowSpeakerIdDropdown(videoDetails?.video?.multiple_speaker);
  //   }
  // }, [videoDetails]);

  useEffect(() => {
    if (currentPage) {
      setCurrentOffset(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    const subtitleScrollEle = document.getElementById("subTitleContainer");
    subtitleScrollEle
      .querySelector(`#sub_${currentIndex}`)
      ?.scrollIntoView(true, { block: "start" });
  }, [currentIndex]);

  const getPayload = (offset = currentOffset, lim = limit) => {
    const payloadObj = new SaveTranscriptAPI(
      taskId,
      // taskData.task_type,
      // offset,
      // lim
    );
    dispatch(APITransport(payloadObj));
  };

  const prevOffsetRef = useRef(currentOffset);
  useEffect(() => {
    if (prevOffsetRef.current !== currentOffset) {
      setUndoStack([]);
      setRedoStack([]);
      prevOffsetRef.current = currentOffset;
    }
    getPayload(currentOffset, limit);
    // eslint-disable-next-line
  }, [limit, currentOffset]);

  const onMergeClick = useCallback(
    (index) => {
      const selectionStart = getSelectionStart(index);
      const timings = getTimings(index);

      setUndoStack((prevState) => [
        ...prevState,
        {
          type: "merge",
          index: index,
          timings,
          selectionStart,
        },
      ]);
      setRedoStack([]);

      const sub = onMerge(index);
      dispatch(setSubtitles(sub, C.SUBTITLES));
      // saveTranscriptHandler(false, true, sub);
    },
    // eslint-disable-next-line
    [limit, currentOffset]
  );

  const onMouseUp = (e, blockIdx) => {
    if (e.target.selectionStart < e.target.value.length) {
      e.preventDefault();
      setShowPopOver(true);
      setCurrentIndexToSplitTextBlock(blockIdx);
      setSelectionStart(e.target.selectionStart);
    }
  };

  const onSplitClick = useCallback(() => {
    setUndoStack((prevState) => [
      ...prevState,
      {
        type: "split",
        index: currentIndexToSplitTextBlock,
        selectionStart,
      },
    ]);
    setRedoStack([]);

    const sub = onSplit(currentIndexToSplitTextBlock, selectionStart);
    dispatch(setSubtitles(sub, C.SUBTITLES));
    // saveTranscriptHandler(false, true, sub);

    // eslint-disable-next-line
  }, [currentIndexToSplitTextBlock, selectionStart, limit, currentOffset]);

  const changeTranscriptHandler = (event, index) => {
    const {
      target: { value },
      currentTarget,
    } = event;
    console.log(value,"eventeventeventevent")

    const containsBackslash = value.includes("\\");

    setEnableTransliterationSuggestion(true);

    if (containsBackslash) {
      setEnableTransliterationSuggestion(false);

      const textBeforeSlash = value.split("\\")[0];
      const currentTargetWord = value.split("\\")[1].split(" ")[0];
      const textAfterSlash = value.split("\\")[1].split(" ").slice(1).join(" ");

      // const tags = getTagsList(videoDetails?.video?.language_label);

      // const filteredSuggestionByInput = Object.entries(tags).filter(([tag]) => {
      //   return tag.toLowerCase().includes(currentTargetWord.toLowerCase());
      // });

      // const filteredSuggestions = Object.fromEntries(filteredSuggestionByInput);

      setCurrentSelectedIndex(index);
      setTagSuggestionsAnchorEl(currentTarget);
      setTextWithoutBackSlash(textBeforeSlash);
      setTextAfterBackSlash(textAfterSlash);

      // if (Object.keys(filteredSuggestions).length) {
      //   setTagSuggestionList(filteredSuggestions);
      // } else {
      //   setTagSuggestionList([]);
      // }
    }

    const sub = onSubtitleChange(value, index);
    dispatch(setSubtitles(sub, C.SUBTITLES));
    // saveTranscriptHandler(false, false, sub);
  };


  const saveTranscriptHandler = async (isFinal,  payload = subtitles ) => {
    setLoading(true);
  
    const reqBody = {
      task_id: taskId,
      // offset: currentOffset,
      // limit: limit,
      payload: {
        payload: payload,
      },
    };
  const obj = new SaveTranscriptAPI(AnnotationsTaskDetails[0]?.id,reqBody);
  const res = await fetch(obj.apiEndPoint(), {
    method: "POST",
    body: JSON.stringify(obj.getBody()),
    headers: obj.getHeaders().headers,
  });
  const resp = await res.json();
  if (res.ok) {
    setSnackbarInfo({
      open: true,
      message: resp?.message,
      variant: "success",
    });

    setLoading(false);

    // if (isFinal) {
    //   setTimeout(() => {
    //     navigate(
    //       `/my-organization/${assignedOrgId}/project/${taskData?.project}`
    //     );
    //   }, 2000);
    // }
  } else {
    setLoading(false);
    setSnackbarInfo({
      open: true,
      message: "Failed",
      variant: "error",
    });
  }
};

  const renderSnackBar = () => {
    return (
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={() =>
          setSnackbarInfo({ open: false, message: "", variant: "" })
        }
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        variant={snackbar.variant}
        message={snackbar.message}
      />
    );
  };

  const handleTimeChange = useCallback(
    (value, index, type, time) => {
      const sub = timeChange(value, index, type, time);
      dispatch(setSubtitles(sub, C.SUBTITLES));
      // saveTranscriptHandler(false, true, sub);
    },
    // eslint-disable-next-line
    [limit, currentOffset]
  );

  const onDelete = useCallback(
    (index) => {
      setUndoStack((prevState) => [
        ...prevState,
        {
          type: "delete",
          index: index,
          data: getItemForDelete(index),
        },
      ]);
      setRedoStack([]);

      const sub = onSubtitleDelete(index);
      dispatch(setSubtitles(sub, C.SUBTITLES));
      // saveTranscriptHandler(false, false, sub);
    },
    // eslint-disable-next-line
    [limit, currentOffset]
  );

  const addNewSubtitleBox = useCallback(
    (index) => {
      const sub = addSubtitleBox(index);
      dispatch(setSubtitles(sub, C.SUBTITLES));
      // saveTranscriptHandler(false, false, sub);

      setUndoStack((prevState) => [
        ...prevState,
        {
          type: "add",
          index: index,
        },
      ]);
      setRedoStack([]);
    },
    // eslint-disable-next-line
    [limit, currentOffset]
  );

  const onUndo = useCallback(() => {
    if (undoStack.length > 0) {
      //getting last last action performed by user
      const lastAction = undoStack[undoStack.length - 1];

      // modifing subtitles based on last action
      const sub = onUndoAction(lastAction);
      dispatch(setSubtitles(sub, C.SUBTITLES));

      //removing the last action from undo and putting in redo stack
      setUndoStack(undoStack.slice(0, undoStack.length - 1));
      setRedoStack((prevState) => [...prevState, lastAction]);
    }

    // eslint-disable-next-line
  }, [undoStack, redoStack]);

  const onRedo = useCallback(() => {
    if (redoStack.length > 0) {
      //getting last last action performed by user
      const lastAction = redoStack[redoStack.length - 1];

      // modifing subtitles based on last action
      const sub = onRedoAction(lastAction);
      dispatch(setSubtitles(sub, C.SUBTITLES));

      //removing the last action from redo and putting in undo stack
      setRedoStack(redoStack.slice(0, redoStack.length - 1));
      setUndoStack((prevState) => [...prevState, lastAction]);
    }

    // eslint-disable-next-line
  }, [undoStack, redoStack]);

  const targetLength = (index) => {
    if (subtitles[index]?.text.trim() !== "")
      return subtitles[index]?.text.trim().split(" ").length;
    return 0;
  };

  const onNavigationClick = (value) => {
    getPayload(value, limit);
  };

  const handleSpeakerChange = (id, index) => {
    const sub = assignSpeakerId(id, index);
    dispatch(setSubtitles(sub, C.SUBTITLES));
    // saveTranscriptHandler(false, false, sub);
  };

  return (
    // <>
    //   {renderSnackBar()}
    //   <Box
    //     className={classes.rightPanelParentBox}
    //     style={{ position: "relative" }}
    //   >
    //     <Grid className={classes.rightPanelParentGrid}>
    //       <SettingsButtonComponent
    //         setTransliteration={setTransliteration}
    //         enableTransliteration={enableTransliteration}
    //         setRTL_Typing={setRTL_Typing}
    //         enableRTL_Typing={enableRTL_Typing}
    //         setFontSize={setFontSize}
    //         fontSize={fontSize}
    //         saveTranscriptHandler={saveTranscriptHandler}
    //         setOpenConfirmDialog={setOpenConfirmDialog}
    //         onUndo={onUndo}
    //         onRedo={onRedo}
    //         undoStack={undoStack}
    //         redoStack={redoStack}
    //         onSplitClick={onSplitClick}
    //         showPopOver={showPopOver}
    //         showSplit={true}
    //       />
    //     </Grid>

    //     <Box id={"subTitleContainer"} className={classes.subTitleContainer}>
    //       {currentPageData?.map((item, index) => {
    //         return (
    //           <Box
    //             key={index}
    //             id={`sub_${index}`}
    //             style={{
    //               padding: "16px",
    //               borderBottom: "1px solid lightgray",
    //               backgroundColor:
    //                 index % 2 === 0
    //                   ? "rgb(214, 238, 255)"
    //                   : "rgb(233, 247, 239)",
    //             }}
    //           >
    //             <Box className={classes.topBox}>
    //               <TimeBoxes
    //                 handleTimeChange={handleTimeChange}
    //                 time={item.start_time}
    //                 index={index}
    //                 type={"startTime"}
    //               />

    //               <ButtonComponent
    //                 index={index}
    //                 lastItem={index < subtitles.length - 1}
    //                 onMergeClick={onMergeClick}
    //                 onDelete={onDelete}
    //                 addNewSubtitleBox={addNewSubtitleBox}
    //               />

    //               <TimeBoxes
    //                 handleTimeChange={handleTimeChange}
    //                 time={item.end_time}
    //                 index={index}
    //                 type={"endTime"}
    //               />
    //             </Box>

    //             <CardContent
    //               className={classes.cardContent}
    //               aria-describedby={"suggestionList"}
    //               onClick={() => {
    //                 if (player) {
    //                   player.pause();
    //                   if (player.duration >= item.startTime) {
    //                     player.currentTime = item.startTime + 0.001;
    //                   }
    //                 }
    //               }}
    //             >
    //               {/* {taskData?.src_language !== "en" && enableTransliteration ? (
    //                 <IndicTransliterate
    //                   lang={taskData?.src_language}
    //                   value={item.text}
    //                   onChange={(event) => {
    //                     changeTranscriptHandler(event, index);
    //                   }}
    //                   enabled={enableTransliterationSuggestion}
    //                   onChangeText={() => {}}
    //                   onMouseUp={(e) => onMouseUp(e, index)}
    //                   containerStyles={{}}
    //                   onBlur={() =>
    //                     setTimeout(() => {
    //                       setShowPopOver(false);
    //                     }, 200)
    //                   }
    //                   renderComponent={(props) => (
    //                     <div className={classes.relative}>
    //                       <textarea
    //                         className={`${classes.customTextarea} ${
    //                           currentIndex === index ? classes.boxHighlight : ""
    //                         }`}
    //                         dir={enableRTL_Typing ? "rtl" : "ltr"}
    //                         rows={4}
    //                         onMouseUp={(e) => onMouseUp(e, index)}
    //                         onBlur={() =>
    //                           setTimeout(() => {
    //                             setShowPopOver(false);
    //                           }, 200)
    //                         }
    //                         style={{ fontSize: fontSize, height: "120px" }}
    //                         {...props}
    //                       />
    //                       <span id="charNum" className={classes.wordCount}>
    //                         {targetLength(index)}
    //                       </span>
    //                     </div>
    //                   )}
    //                 />
    //               ) : ( */}
    //                 <div className={classes.relative}>
    //                   <textarea
    //                     onChange={(event) => {
    //                       changeTranscriptHandler(event, index);
    //                     }}
    //                     onMouseUp={(e) => onMouseUp(e, index)}
    //                     value={item.text}
    //                     dir={enableRTL_Typing ? "rtl" : "ltr"}
    //                     className={`${classes.customTextarea} ${
    //                       currentIndex === index ? classes.boxHighlight : ""
    //                     }`}
    //                     style={{
    //                       fontSize: fontSize,
    //                       height: "120px",
    //                     }}
    //                     rows={4}
    //                     onBlur={() =>
    //                       setTimeout(() => {
    //                         setShowPopOver(false);
    //                       }, 200)
    //                     }
    //                   />
    //                   <span id="charNum" className={classes.wordCount}>
    //                     {targetLength(index)}
    //                   </span>
    //                 </div>
    //               {/* )} */}
    //             </CardContent>

    //             {/* {showSpeakerIdDropdown ? (
    //               <FormControl
    //                 sx={{ width: "50%", mr: "auto", float: "left" }}
    //                 size="small"
    //               >
    //                 <InputLabel id="select-speaker">Select Speaker</InputLabel>
    //                 <Select
    //                   fullWidth
    //                   labelId="select-speaker"
    //                   label="Select Speaker"
    //                   value={item.speaker_id}
    //                   onChange={(event) =>
    //                     handleSpeakerChange(event.target.value, index)
    //                   }
    //                   style={{
    //                     backgroundColor: "#fff",
    //                     textAlign: "left",
    //                   }}
    //                   inputProps={{
    //                     "aria-label": "Without label",
    //                     style: { textAlign: "left" },
    //                   }}
    //                   MenuProps={MenuProps}
    //                 >
    //                   {speakerIdList?.map((speaker, index) => (
    //                     <MenuItem key={index} value={speaker.id}>
    //                       {speaker.name} ({speaker.gender[0]})
    //                     </MenuItem>
    //                   ))}
    //                 </Select>
    //               </FormControl>
    //             ) : null} */}
    //           </Box>
    //         );
    //       })}
    //     </Box>

    //     <Box
    //       className={classes.paginationBox}
    //       style={{
    //         ...(!xl && {
    //           bottom: "-11%",
    //         }),
    //       }}
    //     >
    //        <Pagination
    //   color="primary"
    //     count={Math.ceil(
    //       AnnotationsTaskDetails[0]?.result?.length / itemsPerPage
    //     )}
    //     page={page}
    //     onChange={handlePageChange}
    //   />
    //       {/* <Pagination
    //         range={getSubtitleRangeTranscript()}
    //         rows={totalPages}
    //         previous={previous}
    //         next={next}
    //         onClick={onNavigationClick}
    //         jumpTo={[...Array(transcriptPayload?.total_pages)].map(
    //           (_, index) => index + 1
    //         )}
    //         completedCount={completedCount}
    //         current={currentPage}
    //       /> */}
    //     </Box>

    //     {/* {openConfirmDialog && (
    //       <ConfirmDialog
    //         openDialog={openConfirmDialog}
    //         handleClose={() => setOpenConfirmDialog(false)}
    //         submit={() => saveTranscriptHandler(true)}
    //         message={"Do you want to submit the transcript?"}
    //         loading={loading}
    //       />
    //     )} */}

    //     {/* {Boolean(tagSuggestionsAnchorEl) && (
    //       <TagsSuggestionList
    //         tagSuggestionsAnchorEl={tagSuggestionsAnchorEl}
    //         setTagSuggestionList={setTagSuggestionList}
    //         index={currentSelectedIndex}
    //         filteredSuggestionByInput={tagSuggestionList}
    //         setTagSuggestionsAnchorEl={setTagSuggestionsAnchorEl}
    //         textWithoutBackslash={textWithoutBackSlash}
    //         textAfterBackSlash={textAfterBackSlash}
    //         // saveTranscriptHandler={saveTranscriptHandler}
    //         setEnableTransliterationSuggestion={
    //           setEnableTransliterationSuggestion
    //         }
    //       />
    //     )} */}
    //   </Box>
    // </>
    <>  {renderSnackBar()}
    <Grid sx={{ margin: 0 }}>
      <Box
        className={classes.rightPanelParentBox}
        style={{ position: "relative" }}
      >
        <Grid className={classes.rightPanelParentGrid}>
          <SettingsButtonComponent
            // setTransliteration={setTransliteration}
            // enableTransliteration={enableTransliteration}
            // setRTL_Typing={setRTL_Typing}
            // enableRTL_Typing={enableRTL_Typing}
            // setFontSize={setFontSize}
            // fontSize={fontSize}
            saveTranscriptHandler={saveTranscriptHandler}
            // setOpenConfirmDialog={setOpenConfirmDialog}
            // onUndo={onUndo}
            // onRedo={onRedo}
            // undoStack={undoStack}
            // redoStack={redoStack}
            // onSplitClick={onSplitClick}
            // showPopOver={showPopOver}
            // showSplit={true}
          />
        </Grid>
      </Box>

      <Box id={"subTitleContainer"} className={classes.subTitleContainer}>
        {currentPageData?.map((item, index) => {
          return (
            <Box
              key={index}
              id={`sub_${index}`}
              style={{
                padding: "16px",
                borderBottom: "1px solid lightgray",
                backgroundColor:
                  index % 2 === 0 ? "rgb(214, 238, 255)" : "rgb(233, 247, 239)",
              }}
            >
              <Box className={classes.topBox}>
                <TimeBoxes
                  handleTimeChange={handleTimeChange}
                  time={item.start_time}
                  index={index}
                  type={"startTime"}
                />

                <ButtonComponent
                index={index}
                lastItem={index < subtitles.length - 1}
                onMergeClick={onMergeClick}
                onDelete={onDelete}
                addNewSubtitleBox={addNewSubtitleBox}
                />

                <TimeBoxes
                  handleTimeChange={handleTimeChange}
                  time={item.end_time}
                  index={index}
                  type={"endTime"}
                />
              </Box>

              <CardContent
                className={classes.cardContent}
                aria-describedby={"suggestionList"}
                onClick={() => {
                  if (player) {
                    player.pause();
                    if (player.duration >= item.startTime) {
                      player.currentTime = item.startTime + 0.001;
                    }
                  }
                }}
              >
                {/* {taskData?.src_language !== "en" && enableTransliteration ? (
          <IndicTransliterate
            lang={taskData?.src_language}
            value={item.text}
            onChange={(event) => {
              changeTranscriptHandler(event, index);
            }}
            enabled={enableTransliterationSuggestion}
            onChangeText={() => {}}
            onMouseUp={(e) => onMouseUp(e, index)}
            containerStyles={{}}
            onBlur={() =>
              setTimeout(() => {
                setShowPopOver(false);
              }, 200)
            }
            renderComponent={(props) => (
              <div className={classes.relative}>
                <textarea
                  className={`${classes.customTextarea} ${
                    currentIndex === index ? classes.boxHighlight : ""
                  }`}
                  dir={enableRTL_Typing ? "rtl" : "ltr"}
                  rows={4}
                  onMouseUp={(e) => onMouseUp(e, index)}
                  onBlur={() =>
                    setTimeout(() => {
                      setShowPopOver(false);
                    }, 200)
                  }
                  style={{ fontSize: fontSize, height: "120px" }}
                  {...props}
                />
                <span id="charNum" className={classes.wordCount}>
                  {targetLength(index)}
                </span>
              </div>
            )}
          />
        ) : ( */}
                <div className={classes.relative}>
                  <textarea
                      onChange={(event) => {
                        changeTranscriptHandler(event, index);
                      }}
                      // onMouseUp={(e) => onMouseUp(e, index)}
                    value={item.text}
                    //   dir={enableRTL_Typing ? "rtl" : "ltr"}
                    // className={`${classes.customTextarea} ${
                    //   currentIndex === index ? classes.boxHighlight : ""
                    // }`}
                    className={classes.customTextarea}
                    style={{
                      // fontSize: fontSize,
                      height: "120px",
                    }}
                    rows={4}
                    // onBlur={() =>
                    //   setTimeout(() => {
                    //       setShowPopOver(false);
                    //   }, 200)
                    // }
                  />
                  <span id="charNum" className={classes.wordCount}>
                    {/* {targetLength(index)} */}
                  </span>
                </div>
                {/* )} */}
              </CardContent>
            </Box>
          );
        })}
      </Box>
      <Box
          className={classes.paginationBox}
          // style={{
          //   ...(!xl && {
          //     bottom: "-11%",
          //   }),
          // }}
        >
      <Pagination
      color="primary"
        count={Math.ceil(
          AnnotationsTaskDetails[0]?.result?.length / itemsPerPage
        )}
        page={page}
        onChange={handlePageChange}
      />
       </Box>
    </Grid>
    </>
  );
};

export default memo(TranscriptionRightPanel);
