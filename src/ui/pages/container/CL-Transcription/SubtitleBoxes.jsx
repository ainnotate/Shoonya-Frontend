import React, {
  useEffect,
  useCallback,
  useState,
  createRef,
  memo,
} from "react";
import isEqual from "lodash/isEqual";
import DT from "duration-time-conversion";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  copySubs,
  getKeyCode,
  hasSub,
  isPlaying,
  onMerge,
  onSubtitleDelete,
} from "../../../../utils/SubTitlesUtils";

//Styles
import AudioTranscriptionLandingStyle from "../../../styles/AudioTranscriptionLandingStyle";

//Components
import {
  ContextMenu,
  MenuItem,
  ContextMenuTrigger,
  connectMenu,
} from "react-contextmenu";
import CustomizedSnackbars from "../../component/common/Snackbar";

//APIs
import C from "../../../../redux/constants";
import {
  setSubtitles,
  setCurrentIndex,
} from "../../../../redux/actions/Common";

// Add this style to the head to ensure context menu is always on top
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  .react-contextmenu {
    z-index: 99999 !important;
    position: fixed !important;
  }
  
  /* Ensure menu items are opaque */
  .react-contextmenu-item {
    background-color: white !important;
    opacity: 1 !important;
  }
  
  /* Force visibility */
  .react-contextmenu--visible {
    opacity: 1 !important;
    pointer-events: auto !important;
    visibility: visible !important;
  }
`;
document.head.appendChild(styleTag);

function magnetically(time, closeTime) {
  if (!closeTime) return time;
  if (time > closeTime - 0.02 && closeTime + 0.02 > time) {
    return closeTime;
  }
  return time;
}

// Using global variables like in your original code
let lastTarget = null;
let lastSub = null;
let lastType = "";
let lastX = 0;
let lastIndex = -1;
let lastWidth = 0;
let lastDiffX = 0;
let isDroging = false;
let playUntil = 0;

function SubtitleBoxes({ render, currentTime, duration, allowOverlap = true, onToggleOverlap }) {
  const { taskId } = useParams();
  const classes = AudioTranscriptionLandingStyle();
  const dispatch = useDispatch();

  const $blockRef = createRef();
  const $subsRef = createRef();
  const result = useSelector((state) => state.commonReducer?.subtitles);
  const player = useSelector((state) => state.commonReducer?.player);
  const AnnotationsTaskDetails = useSelector(
    (state) => state.getAnnotationsTask?.data
  );
  
  // Get the currentIndex from Redux to highlight the selected box
  const reduxCurrentIndex = useSelector((state) => state.commonReducer?.currentIndex);

  const [taskData, setTaskData] = useState([]);
  const [currentSubs, setCurrentSubs] = useState([]);
  const [textBox, settextBox] = useState("");
  const [speakerBox, setSpeakerBox] = useState("");
  const [snackbar, setSnackbarInfo] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  // Reset lastSub when subtitles change or when it's no longer valid
  useEffect(() => {
    if (result) {
      // Filter out hidden segments
      const visibleSubs = result.filter(sub => !sub.hidden);
      setCurrentSubs(visibleSubs);
      
      // Reset lastSub if it's no longer in the subtitles array
      if (lastSub && hasSub(lastSub) < 0) {
        lastSub = null;
        lastIndex = -1;
      }
    }
  }, [result]);

  const gridGap = document.body.clientWidth / render.gridNum;
  
  // Find the currently playing subtitle based on time
  const playingIndex = currentSubs?.findIndex(
    (item) => item?.startTime <= currentTime && item?.endTime > currentTime
  );
  
  const AnnotationStage = localStorage.getItem("Stage") === "annotation"
  const SuperCheckerStage = localStorage.getItem("SuperCheckerStage") === "superChecker"

  useEffect(() => {
    const hasEmptyText = result?.some((element) => element?.text?.trim() === "");
    const hasEmptySpeaker = result?.some(
      (element) => element?.speaker_id?.trim() === ""
    );
    settextBox(hasEmptyText);
    setSpeakerBox(hasEmptySpeaker);
  }, [result]);

  useEffect(() => {
    if (AnnotationStage) {
      let Annotation = AnnotationsTaskDetails?.filter(
        (annotation) => annotation?.annotation_type === 1
      )[0];
      setTaskData(Annotation);
    } else if (SuperCheckerStage) {
      let superchecker = AnnotationsTaskDetails?.filter(
        (annotation) => annotation?.annotation_type === 3
      )[0];
      setTaskData(superchecker);
    } else {
      let review = AnnotationsTaskDetails?.filter(
        (annotation) => annotation?.annotation_type === 2
      )[0];
      setTaskData(review);
    }
  }, [AnnotationsTaskDetails]);

  const removeSub = useCallback(
    (sub) => {
      // Check if sub exists
      if (!sub) {
        console.warn("Attempted to remove null subtitle");
        return;
      }
      
      // Don't allow removing locked segments
      if (sub.locked) {
        setSnackbarInfo({
          open: true,
          message: "Cannot delete locked segment",
          variant: "warning",
        });
        return;
      }
      
      const index = hasSub(sub);
      
      // Check for valid index
      if (index < 0) {
        console.warn("Invalid subtitle index:", index);
        return;
      }
      
      const res = onSubtitleDelete(index);
      dispatch(setSubtitles(res, C.SUBTITLES));
    },
    // eslint-disable-next-line
    [result]
  );

  const mergeSub = useCallback(
    (sub) => {
      // Check if sub exists
      if (!sub) {
        console.warn("Attempted to merge null subtitle");
        return;
      }
      
      // Don't allow merging locked segments
      if (sub.locked) {
        setSnackbarInfo({
          open: true,
          message: "Cannot merge locked segment",
          variant: "warning",
        });
        return;
      }
      
      // Check for valid index
      const index = hasSub(sub);
      if (index < 0 || index >= result?.length - 1) {
        console.warn("Invalid subtitle index for merge:", index);
        return;
      }
      
      // Check if next segment is locked
      const nextSub = result[index + 1];
      if (nextSub && nextSub.locked) {
        setSnackbarInfo({
          open: true,
          message: "Cannot merge with locked segment",
          variant: "warning",
        });
        return;
      }
      
      const res = onMerge(index);
      dispatch(setSubtitles(res, C.SUBTITLES));
    },
    // eslint-disable-next-line
    [result]
  );

  const updateSub = useCallback(
    (sub, obj) => {
      // Check if sub exists
      if (!sub) {
        console.warn("Attempted to update null subtitle");
        return;
      }
      
      // Don't allow updating locked segments
      if (sub.locked) {
        setSnackbarInfo({
          open: true,
          message: "Cannot modify locked segment",
          variant: "warning",
        });
        return;
      }
      
      const index = hasSub(sub);
      
      // Check for valid index
      if (index < 0) {
        console.warn("Invalid subtitle index:", index);
        return;
      }
      
      const copySub = [...result];
      Object.assign(sub, obj);
      copySub[index] = sub;
      dispatch(setSubtitles(copySub, C.SUBTITLES));
    },
    // eslint-disable-next-line
    [result]
  );

  const onMouseDown = (sub, event, type) => {
    // Check if sub exists
    if (!sub) {
      console.warn("Attempted to interact with null subtitle");
      return;
    }
    
    // Don't allow dragging locked segments
    if (sub.locked) {
      setSnackbarInfo({
        open: true,
        message: "Cannot modify locked segment",
        variant: "warning",
      });
      return;
    }
    
    lastSub = sub;
    if (event.button !== 0) return;
    
    // Get index and check validity
    const index = result?.indexOf(sub);
    if (index < 0) {
      console.warn("Invalid subtitle index:", index);
      return;
    }
    
    isDroging = true;
    lastType = type;
    lastX = event.pageX;
    lastIndex = index;
    
    // Check if $subsRef.current exists and has children
    if ($subsRef.current && $subsRef.current.children && $subsRef.current.children[lastIndex]) {
      lastTarget = $subsRef.current.children[lastIndex];
      lastWidth = parseFloat(lastTarget?.style.width || "0");
    } else {
      console.warn("Could not find DOM element for subtitle at index:", lastIndex);
      isDroging = false;
    }
  };

  const onDocumentMouseMove = useCallback((event) => {
    if (isDroging && lastTarget) {
      lastDiffX = event.pageX - lastX;
      if (lastType === "left") {
        lastTarget.style.width = `${lastWidth - lastDiffX}px`;
        lastTarget.style.transform = `translate(${lastDiffX}px)`;
      } else if (lastType === "right") {
        lastTarget.style.width = `${lastWidth + lastDiffX}px`;
      } else {
        lastTarget.style.transform = `translate(${lastDiffX}px)`;
      }
    }
  }, []);

  const onDocumentMouseUp = useCallback(() => {
    if (isDroging && lastTarget && lastDiffX) {
      const timeDiff = lastDiffX / gridGap / 10;
      const index = hasSub(lastSub);
      const previou = result?.[index - 1];
      const next = result?.[index + 1];

      // Calculate the target start and end times
      const rawStartTime = lastSub.startTime + timeDiff;
      const rawEndTime = lastSub.endTime + timeDiff;
      
      // Only apply magnetic snapping if allowOverlap is false
      const startTime = allowOverlap ? rawStartTime : magnetically(
        rawStartTime,
        previou ? previou.endTime : null
      );
      const endTime = allowOverlap ? rawEndTime : magnetically(
        rawEndTime,
        next ? next.startTime : null
      );
      
      const width = (endTime - startTime) * 10 * gridGap;

      // Minimum segment duration - keeps this constraint regardless of overlap setting
      const minDuration = 0.2;  // 200ms

      if (lastType === "left") {
        if (lastSub.endTime - startTime >= minDuration) {
          const start_time = DT.d2t(Math.max(0, startTime));

          // If overlap is allowed, update regardless of adjacent segments
          if (allowOverlap) {
            updateSub(lastSub, { start_time });
          } else {
            // Original logic for preventing overlap
            if (index > 0 && startTime >= DT.t2d(previou.end_time)) {
              updateSub(lastSub, { start_time });
            }

            if (index === 0) {
              updateSub(lastSub, { start_time });
            }
          }
        } else {
          // Keep minimum width constraint
          lastTarget.style.width = `${width}px`;
        }
      } else if (lastType === "right") {
        if (endTime >= 0 && endTime - lastSub.startTime >= minDuration) {
          const end_time = DT.d2t(Math.min(endTime, duration));

          // If overlap is allowed, update regardless of adjacent segments
          if (allowOverlap) {
            updateSub(lastSub, { end_time });
          } else {
            // Original logic for preventing overlap
            if (index >= 0 && index !== result?.length - 1 && endTime <= DT.t2d(next.start_time)) {
              updateSub(lastSub, { end_time });
            }
            
            if (index === result?.length - 1) {
              updateSub(lastSub, { end_time });
            }
          }
        } else {
          // Keep minimum width constraint
          lastTarget.style.width = `${width}px`;
        }
      } else {
        // Moving the entire segment
        if (startTime > 0 && endTime > 0 && endTime - startTime >= minDuration) {
          const start_time = DT.d2t(startTime);
          const end_time = DT.d2t(endTime);
          
          // If overlap is allowed, update regardless of adjacent segments
          if (allowOverlap) {
            updateSub(lastSub, {
              start_time,
              end_time,
            });
          } else {
            // Original logic for preventing overlap
            if (result?.length > 1) {
              if (
                index > 0 && index !== result?.length - 1 &&
                startTime >= DT.t2d(previou?.end_time) &&
                endTime <= DT.t2d(next?.start_time)
              ) {
                updateSub(lastSub, {
                  start_time,
                  end_time,
                });
              }

              if (index === 0 && endTime <= DT.t2d(next.start_time)) {
                updateSub(lastSub, {
                  start_time,
                  end_time,
                });
              }
              if (index === result?.length - 1 && startTime >= DT.t2d(previou?.end_time)) {
                updateSub(lastSub, {
                  start_time,
                  end_time,
                });
              }
            }
            else {
              updateSub(lastSub, {
                start_time,
                end_time,
              });
            }
          }
        }
      }
      
      // Reset the visual appearance of the segment
      lastTarget.style.transform = `translate(0)`;
      lastTarget.style.width = `${width}px`;
    }

    // Reset state variables
    lastType = "";
    lastX = 0;
    lastWidth = 0;
    lastDiffX = 0;
    isDroging = false;
  }, [gridGap, result, updateSub, duration, allowOverlap]);

  const onKeyDown = useCallback(
    (event) => {
      const copySub = copySubs();

      // Check if lastIndex is valid
      if (lastIndex < 0 || lastIndex >= copySub?.length) {
        return;
      }

      const sub = copySub[lastIndex];
      
      // Check if sub and lastTarget exist
      if (!sub || !lastTarget) {
        return;
      }
      
      // Don't allow keyboard actions on locked segments
      if (sub.locked) {
        setSnackbarInfo({
          open: true,
          message: "Cannot modify locked segment",
          variant: "warning",
        });
        return;
      }
      
      const keyCode = getKeyCode(event);

      switch (keyCode) {
        case 37:
          updateSub(sub, {
            start_time: DT.d2t(sub?.startTime - 0.1),
            end_time: DT.d2t(sub?.endTime - 0.1),
          });
          break;
        case 39:
          updateSub(sub, {
            start_time: DT.d2t(sub?.startTime + 0.1),
            end_time: DT.d2t(sub?.endTime + 0.1),
          });
          break;
        case 8:
        case 46:
          removeSub(sub);
          break;
        default:
          break;
      }
    },
    // eslint-disable-next-line
    [player, removeSub, updateSub]
  );

  // Fixed DynamicMenu component with null checks
  const DynamicMenu = connectMenu("contextmenu")((props) => {
    const { id, trigger } = props;
    
    return (
      <ContextMenu id={id} className={classes.menuItemNav} style={{
        backgroundColor: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '5px 0',
        minWidth: '200px',
        zIndex: 99999, // Extremely high z-index to ensure it's on top
        position: 'fixed', // Use fixed instead of relative
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
      }}>
        <MenuItem
          className={classes.menuItem}
          onClick={() => {
            // Check if lastSub exists
            if (!lastSub) {
              setSnackbarInfo({
                open: true,
                message: "No segment selected",
                variant: "warning",
              });
              return;
            }
            
            removeSub(lastSub);
          }}
          disabled={!lastSub || (lastSub && lastSub.locked)}
          style={{ 
            opacity: (!lastSub || (lastSub && lastSub.locked)) ? 0.5 : 1,
            padding: '8px 15px',
            cursor: (!lastSub || (lastSub && lastSub.locked)) ? 'not-allowed' : 'pointer',
            backgroundColor: 'white',
            color: 'black',
          }}
        >
          Delete Subtitle
        </MenuItem>
        
        {lastSub && result && result.length > 0 && result.indexOf(lastSub) < result.length - 1 && (
          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              // Check again in case things changed
              if (!lastSub) {
                setSnackbarInfo({
                  open: true,
                  message: "No segment selected",
                  variant: "warning",
                });
                return;
              }
              
              mergeSub(lastSub);
            }}
            disabled={!lastSub || (lastSub && lastSub.locked)}
            style={{ 
              opacity: (!lastSub || (lastSub && lastSub.locked)) ? 0.5 : 1,
              padding: '8px 15px',
              cursor: (!lastSub || (lastSub && lastSub.locked)) ? 'not-allowed' : 'pointer',
              backgroundColor: 'white',
              color: 'black',
            }}
          >
            Merge Next
          </MenuItem>
        )}
                  
{/*        <MenuItem
          className={classes.menuItem}
          onClick={() => {
            const newAllowOverlap = !allowOverlap;
            if (typeof onToggleOverlap === 'function') {
              onToggleOverlap(newAllowOverlap);
            }
            setSnackbarInfo({
              open: true,
              message: `Segment overlap ${newAllowOverlap ? 'enabled' : 'disabled'}`,
              variant: "info",
            });
          }}
          style={{ 
            padding: '8px 15px',
            borderTop: '1px solid #eee',
            marginTop: '5px',
            paddingTop: '10px',
            backgroundColor: allowOverlap ? 'rgba(0, 128, 128, 0.1)' : 'rgba(153, 51, 0, 0.1)',
            cursor: 'pointer',
            opacity: 1,
            color: 'black',
          }}
        >
          {allowOverlap ? "Disable Segment Overlap" : "Enable Segment Overlap"}
        </MenuItem>
*/}      </ContextMenu>
    );
  });

  useEffect(() => {
    document.addEventListener("mousemove", onDocumentMouseMove);
    document.addEventListener("mouseup", onDocumentMouseUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousemove", onDocumentMouseMove);
      document.removeEventListener("mouseup", onDocumentMouseUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onDocumentMouseMove, onDocumentMouseUp, onKeyDown]);

  const attributes = {
    className: classes.contextMenu,
    style: {
      zIndex: 99999 // Ensure extremely high z-index for the context menu trigger as well
    }
  };

  const handleDoubleClick = (sub) => {
    // Check if sub and player exist
    if (!sub || !player) {
      if (!sub) {
        console.warn("Attempted to play null subtitle");
      }
      return;
    }
    
    try {
      // For locked segments, use string times directly to avoid issues with getters
      if (sub.locked) {
        // Check if start_time and end_time exist
        if (!sub.start_time || !sub.end_time) {
          throw new Error("Missing time values");
        }
        
        const startSeconds = DT.t2d(sub.start_time);
        const endSeconds = DT.t2d(sub.end_time);
        
        if (!isFinite(startSeconds) || !isFinite(endSeconds)) {
          throw new Error("Invalid time values");
        }
        
        playUntil = endSeconds;
        player.currentTime = startSeconds;
      } else {
        // For regular segments, use the getters
        playUntil = sub.endTime;
        player.currentTime = sub.startTime;
      }
      
      player.play();
      player.addEventListener("timeupdate", onTimeUpdate);
      player.addEventListener("pause", onPause);
    } catch (error) {
      console.error("Error in handleDoubleClick:", error, { sub });
      setSnackbarInfo({
        open: true,
        message: `Error playing segment: ${error.message}`,
        variant: "error",
      });
    }
    
    return () => {
      player.removeEventListener("timeupdate", onTimeUpdate);
      player.removeEventListener("pause", onPause);
    };
  };

  const onTimeUpdate = () => {
    if (!player || !isFinite(playUntil) || playUntil <= 0) {
      playUntil = 0;
      return;
    }
    
    if (player.currentTime >= playUntil) {
      playUntil = 0;
      player.pause();
      player.removeEventListener("timeupdate", onTimeUpdate);
      player.removeEventListener("pause", onPause);
    }
  };
  
  const onPause = () => {
    playUntil = 0;
    player.removeEventListener("timeupdate", onTimeUpdate);
    player.removeEventListener("pause", onPause);
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

  // Helper function to explicitly set cursor styles
  const setCursorStyle = (element, style) => {
    if (element && element.style) {
      element.style.cursor = style;
    }
  };

  // Create a dedicated context menu for locked segments
  const LockedDynamicMenu = connectMenu("locked-contextmenu")((props) => {
    const { id, trigger } = props;
    
    return (
      <ContextMenu id={id} className={classes.menuItemNav} style={{
        backgroundColor: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '5px 0',
        minWidth: '200px',
        zIndex: 99999, // Extremely high z-index to ensure it's on top
        position: 'fixed', // Use fixed instead of relative
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
      }}>        
        <MenuItem
          className={classes.menuItem}
          style={{ 
            padding: '8px 15px',
            cursor: 'not-allowed',
            opacity: 0.5,
            backgroundColor: 'white',
            color: 'black',
          }}
        >
          <i>Cannot Edit Locked Segment</i>
        </MenuItem>
      </ContextMenu>
    );
  });

  return (
    <div className={classes.parentSubtitleBox} ref={$blockRef}>
      {renderSnackBar()}
      {/* Add a visual indicator for overlap mode */}
      <div ref={$subsRef}>
        {currentSubs?.map((sub, key) => {
          // Skip hidden segments completely
          if (sub?.hidden) return null;
          
          const isLocked = sub?.locked === true;
          const isCurrentSub = result.indexOf(sub) === reduxCurrentIndex;
          
          return (
            <div
              className={`${classes.subItem}`}
              key={key}
              style={{
                left:
                  render.padding * gridGap +
                  (sub.startTime - render.beginTime) * gridGap * 10,
                width: (sub.endTime - sub.startTime) * gridGap * 10,
                // Visual indicator for locked segments
                border: isLocked ? "2px solid #f44336" : 
                       isCurrentSub ? "2px solid #008080" : undefined,
                background: isLocked ? 
                  'repeating-linear-gradient(45deg, rgba(255,0,0,0.1), rgba(255,0,0,0.1) 10px, rgba(255,0,0,0.2) 10px, rgba(255,0,0,0.2) 20px)' : 
                  isCurrentSub ? 
                  'linear-gradient(0deg, rgba(0,128,128,0.1), rgba(0,128,128,0.3))' : 
                  undefined,
                // Add z-index to handle overlapping segments and ensure selected is on top
                zIndex: isCurrentSub ? 20 : 1,
                // Add box shadow for selected subtitle
                boxShadow: isCurrentSub ? 
                          '0 0 10px rgba(0,128,128,0.5)' : undefined,
              }}
              onClick={(e) => {
                // Find the index in the original subtitles array
                const originalIndex = result.indexOf(sub);
                if (originalIndex !== -1) {
                  // Use dispatch to update the global state for currentIndex
                  dispatch(setCurrentIndex(originalIndex, C.CURRENT_INDEX)); // Use your actual action and constant
                  
                  // Optional: Scroll to the corresponding subtitle in the right panel
                  setTimeout(() => {
                    const subtitleScrollEle = document.getElementById("subTitleContainer");
                    subtitleScrollEle
                      ?.querySelector(`#sub_${originalIndex}`)
                      ?.scrollIntoView({ block: "center", behavior: "smooth" });
                  }, 50);
                }
              }}
              onDoubleClick={() => handleDoubleClick(sub)}
            >
            {isLocked ? (
              // For locked segments, use ContextMenuTrigger with different ID
              <ContextMenuTrigger
                id="locked-contextmenu"
                holdToDisplay={-1}
                parentSub={sub}
                collect={(props) => props}
                attributes={attributes}
              >
                {/* Left handle with explicit cursor setting */}
                <div
                  className={classes.subHandle}
                  style={{
                    left: 0,
                    width: 10,
                    backgroundColor: "rgba(244, 67, 54, 0.3)",
                  }}
                  onMouseEnter={(e) => setCursorStyle(e.currentTarget, 'not-allowed')}
                  onMouseLeave={(e) => setCursorStyle(e.currentTarget, 'default')}
                ></div>

                {/* Middle text section with explicit cursor setting */}
                <div
                  className={classes.subText}
                  title={`${sub.text} (Locked)`}
                  style={{
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                    border: (sub.speaker_id === "Speaker 1"
                      ? "0.5px solid rgb(0, 87, 158, 1)"
                      : sub.speaker_id === "Speaker 0"
                      ? "0.5px solid rgb(123, 29, 0, 1)"
                      : "0.5px solid rgb(0, 0, 0, 1)"),
                    borderColor: "#f44336",
                  }}
                  onMouseEnter={(e) => setCursorStyle(e.currentTarget, 'not-allowed')}
                  onMouseLeave={(e) => setCursorStyle(e.currentTarget, 'default')}
                >
                  <p className={classes.subTextP}>
                    {sub.text}
                    <span style={{ color: '#f44336', marginLeft: '5px' }}>🔒</span>
                  </p>
                </div>

                {/* Right handle with explicit cursor setting */}
                <div
                  className={classes.subHandle}
                  style={{
                    right: 0,
                    width: 10,
                    backgroundColor: "rgba(244, 67, 54, 0.3)",
                  }}
                  onMouseEnter={(e) => setCursorStyle(e.currentTarget, 'not-allowed')}
                  onMouseLeave={(e) => setCursorStyle(e.currentTarget, 'default')}
                ></div>
                <div className={classes.subDuration}>{sub.duration}</div>
              </ContextMenuTrigger>
            ) : (
              // For normal segments, use ContextMenuTrigger (existing code)
              <ContextMenuTrigger
                id="contextmenu"
                holdToDisplay={-1}
                parentSub={sub}
                collect={(props) => props}
                attributes={attributes}
              >
                {/* Left handle */}
                <div
                  className={classes.subHandle}
                  style={{
                    left: 0,
                    width: 10,
                    backgroundColor: isCurrentSub ? "rgba(0, 128, 128, 0.5)" : undefined,
                  }}
                  onMouseDown={(event) => onMouseDown(sub, event, "left")}
                  onMouseEnter={(e) => setCursorStyle(e.currentTarget, 'col-resize')}
                  onMouseLeave={(e) => setCursorStyle(e.currentTarget, 'default')}
                ></div>

                {/* Middle text section */}
                <div
                  className={classes.subText}
                  title={sub.text}
                  style={{
                    backgroundColor: isCurrentSub ? 
                      "rgba(0, 128, 128, 0.2)" :
                      sub.speaker_id === "Speaker 1"
                        ? "rgb(0, 87, 158, 0.2)"
                        : sub.speaker_id === "Speaker 0"
                        ? "rgb(123, 29, 0, 0.2)"
                        : "rgb(0, 0, 0, 0.6)",
                    border: isCurrentSub ?
                      "0.5px solid rgb(0, 128, 128)" :
                      sub.speaker_id === "Speaker 1"
                        ? "0.5px solid rgb(0, 87, 158, 1)"
                        : sub.speaker_id === "Speaker 0"
                        ? "0.5px solid rgb(123, 29, 0, 1)"
                        : "0.5px solid rgb(0, 0, 0, 1)",
                    fontWeight: isCurrentSub ? "bold" : "normal",
                  }}
                  onMouseDown={(event) => onMouseDown(sub, event)}
                  onMouseEnter={(e) => setCursorStyle(e.currentTarget, 'move')}
                  onMouseLeave={(e) => setCursorStyle(e.currentTarget, 'default')}
                >
                  <p className={classes.subTextP}>
                    {sub.text}
                  </p>
                </div>

                {/* Right handle */}
                <div
                  className={classes.subHandle}
                  style={{
                    right: 0,
                    width: 10,
                    backgroundColor: isCurrentSub ? "rgba(0, 128, 128, 0.5)" : undefined,
                  }}
                  onMouseDown={(event) => onMouseDown(sub, event, "right")}
                  onMouseEnter={(e) => setCursorStyle(e.currentTarget, 'col-resize')}
                  onMouseLeave={(e) => setCursorStyle(e.currentTarget, 'default')}
                ></div>
                <div className={classes.subDuration}>{sub.duration}</div>
              </ContextMenuTrigger>
            )}
            </div>
          );
        })}
      </div>
      <DynamicMenu />
      <LockedDynamicMenu />
    </div>
  );
}

export default memo(SubtitleBoxes, (prevProps, nextProps) => {
  return (
    isEqual(prevProps.result, nextProps.result) &&
    isEqual(prevProps.render, nextProps.render) &&
    prevProps.currentTime === nextProps.currentTime &&
    prevProps.allowOverlap === nextProps.allowOverlap
  );
});