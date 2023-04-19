import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import LabelStudio from "@heartexlabs/label-studio";
import {
  Tooltip,
  Button,
  Box,
  Card,
  TextField,
  Grid,
  Typography,
  Popover,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import CustomizedSnackbars from "../../component/common/Snackbar";
import generateLabelConfig from "../../../../utils/LabelConfig/ConversationTranslation";
import { styled, alpha } from "@mui/material/styles";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Glossary from "../Glossary/Glossary";
import { TabsSuggestionData } from "../../../../utils/TabsSuggestionData/TabsSuggestionData";
import InfoIcon from '@mui/icons-material/Info';
import getCaretCoordinates from "textarea-caret";

import {
  getProjectsandTasks,
  getNextProject,
  fetchAnnotation,
  postReview,
  patchSuperChecker,
} from "../../../../redux/actions/api/LSFAPI/LSFAPI";

import { useParams, useNavigate } from "react-router-dom";
import useFullPageLoader from "../../../../hooks/useFullPageLoader";

import styles from "./lsf.module.css";
import "./lsf.css";
import { useSelector } from "react-redux";
import { translate } from "../../../../config/localisation";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

const filterAnnotations = (annotations, user_id) => {
  let filteredAnnotations = annotations;
  let userAnnotation = annotations.find((annotation) => {
    return annotation.completed_by === user_id && annotation.parent_annotation;
  });
  if (userAnnotation) {
    if (userAnnotation.annotation_status === "unreviewed") {
      filteredAnnotations =
        userAnnotation.result.length > 0
          ? annotations.filter(
              (annotation) => annotation.id === userAnnotation.parent_annotation
            )
          : annotations.filter((annotation) => !annotation.parent_annotation);
    } else if (
      [
        "accepted",
        "accepted_with_minor_changes",
        "accepted_with_major_changes",
        "draft"
      ].includes(userAnnotation.annotation_status)
    ) {
      filteredAnnotations = [userAnnotation];
    } else if (userAnnotation.annotation_status === "skipped") {
      filteredAnnotations = annotations.filter(
        (annotation) => !annotation.parent_annotation
      );
    } else if (userAnnotation.annotation_status === "to_be_revised") {
      filteredAnnotations = annotations.filter(
        (annotation) => annotation.id === userAnnotation.parent_annotation
      );
    }
  }
  return filteredAnnotations;
};

//used just in postAnnotation to support draft status update.

const LabelStudioWrapper = ({
  reviewNotesRef,
  annotationNotesRef,
  loader,
  showLoader,
  hideLoader,
  resetNotes,
  getTaskData,
}) => {
  // we need a reference to a DOM node here so LSF knows where to render
  const review_status = useRef();
  const rootRef = useRef();
  // this reference will be populated when LSF initialized and can be used somewhere else
  const lsfRef = useRef();
  const navigate = useNavigate();
  const [labelConfig, setLabelConfig] = useState();
  const [snackbar, setSnackbarInfo] = useState({
    open: false,
    message: "",
    variant: "success",
  });
  const [taskData, setTaskData] = useState(undefined);
  const { projectId, taskId } = useParams();
  const userData = useSelector((state) => state.fetchLoggedInUserData.data);
  const ProjectDetails = useSelector((state) => state.getProjectDetails.data);
  let loaded = useRef();

  const [showTagSuggestionsAnchorEl, setShowTagSuggestionsAnchorEl] =
    useState(null);
  const [tagSuggestionList, setTagSuggestionList] = useState();

  //console.log("projectId, taskId", projectId, taskId);
  // debugger

  useEffect(() => {
    localStorage.setItem(
      "labelStudio:settings",
      JSON.stringify({
        bottomSidePanel: ProjectDetails?.project_type?.includes("Audio") ? false : true ,
        continuousLabeling: false,
        enableAutoSave: false,
        enableHotkeys: true,
        enableLabelTooltips: true,
        enablePanelHotkeys: true,
        enableTooltips: false,
        fullscreen: false,
        imageFullSize: false,
        selectAfterCreate: false,
        showAnnotationsPanel: true,
        showLabels: false,
        showLineNumbers: false,
        showPredictionsPanel: true,
        sidePanelMode: "SIDEPANEL_MODE_REGIONS",
      })
    );
  }, []);

  const tasksComplete = (id) => {
    if (id) {
      resetNotes();
      navigate(`/projects/${projectId}/SuperChecker/${id}`);
    } else {
      // navigate(-1);
      resetNotes();
      setSnackbarInfo({
        open: true,
        message: "No more tasks to label",
        variant: "info",
      });
      setTimeout(() => {
        // localStorage.removeItem("labelAll");
        // window.location.replace(`/#/projects/${projectId}`);
        // window.location.reload();
      }, 1000);
    }
  };

  function LSFRoot(
    rootRef,
    lsfRef,
    userData,
    projectId,
    taskData,
    labelConfig,
    annotations,
    predictions,
    annotationNotesRef,
    reviewNotesRef,
    projectType
  ) {
    let load_time;
    let interfaces = [];
    if (predictions == null) predictions = [];

   

    if (taskData.task_status === "freezed") {
      interfaces = [
        "panel",
        //"update",
        // "submit",
        "skip",
        "controls",
        "infobar",
        "topbar",
        "instruction",
        ...(projectType === "SingleSpeakerAudioTranscriptionEditing"
          ? ["side-column"]
          : []),
        "annotations:history",
        "annotations:tabs",
        "annotations:menu",
        "annotations:current",
        // "annotations:add-new",
        "annotations:delete",
        "annotations:view-all",
        "predictions:tabs",
        "predictions:menu",
        // "auto-annotation",
        "edit-history",
      ];
    } else {
      interfaces = [
        "panel",
        //"update",
        "submit",
        "skip",
        "controls",
        "infobar",
        "topbar",
        "instruction",
        ...(projectType === "SingleSpeakerAudioTranscriptionEditing"
          ? ["side-column"]
          : []),
        "annotations:history",
        "annotations:tabs",
        "annotations:menu",
        "annotations:current",
        // "annotations:add-new",
        // "annotations:delete",
        "annotations:view-all",
        "predictions:tabs",
        "predictions:menu",
        // "auto-annotation",
        "edit-history",
      ];
    }

    if (rootRef.current) {
      if (lsfRef.current) {
        lsfRef.current.destroy();
      }
      lsfRef.current = new LabelStudio(rootRef.current, {
        /* all the options according to the docs */
        config: labelConfig,

        interfaces: interfaces,

        user: {
          pk: userData.id,
          firstName: userData.first_name,
          lastName: userData.last_name,
        },

        task: {
          // annotations: annotations.filter((annotation) => !annotation.parent_annotation).concat(annotations.filter((annotation) => annotation.id === taskData.correct_annotation)),
          annotations: filterAnnotations(annotations, userData.id),
          predictions: predictions,
          id: taskData.id,
          data: taskData.data,
        },

        onLabelStudioLoad: function (ls) {
          // if (taskData.correct_annotation) {
          //   let annotation = annotations.find(
          //     (annotation) =>
          //       annotation.id === taskData.correct_annotation
          //   );
          //   ls.annotationStore.selectAnnotation(annotation.result[0].id);
          // } else {
          // let hasReview = false;
          // for (let i = 0; i < annotations.length; i++) {
          //   console.log(annotations[i], "test");
          //   if (annotations[i].parent_annotation) {
          //     ls.annotationStore.selectAnnotation(annotations[i].result[0].id);
          //     // hasReview = true;
          //     break;
          //   }
          // }
          // if (!hasReview) {
          //   var c = ls.annotationStore.addAnnotation({
          //     userGenerate: true,
          //   });
          //   ls.annotationStore.selectAnnotation(c.id);
          // }
          // }
          load_time = new Date();
        },

        onSkipTask: function (annotation) {
          // message.warning('Notes will not be saved for skipped tasks!');
          let review = annotations.find(
            (annotation) => !annotation.parentAnnotation
          );
          if (review) {
            showLoader();
            patchSuperChecker(
              review.id,
              load_time,
              review.lead_time,
              "skipped",
              reviewNotesRef.current.value
            ).then(() => {
              getNextProject(projectId, taskData.id, "supercheck").then((res) => {
                hideLoader();
                tasksComplete(res?.id || null);
              });
            });
          }
        },

      
        onUpdateAnnotation: function (ls, annotation) {
          if (taskData.annotation_status !== "freezed") {
            for (let i = 0; i < annotations.length; i++) {
              if (
                !annotations[i].result?.length ||
                annotation.serializeAnnotation()[0].id ===
                  annotations[i].result[0].id
              ) {
                showLoader();
                let temp = annotation.serializeAnnotation();

                for (let i = 0; i < temp.length; i++) {
                  if (temp[i].value.text) {
                    temp[i].value.text = [temp[i].value.text[0]];
                  }
                }

                let superChecker = annotations.filter(
                  (value) => value.annotation_type === 3
                )[0];
               

                patchSuperChecker(
                  superChecker.id,
                  load_time,
                  superChecker.lead_time,
                  review_status.current,
                  projectType === "SingleSpeakerAudioTranscriptionEditing"
                    ? annotation.serializeAnnotation()
                    : temp,
                    superChecker.parent_annotation,
                 
                ).then(() => {
                  if (localStorage.getItem("labelAll"))
                    getNextProject(projectId, taskData.id, "supercheck").then(
                      (res) => {
                        hideLoader();
                        tasksComplete(res?.id || null);
                      }
                    );
                  else {
                    hideLoader();
                    window.location.reload();
                  }
                });
              }
            }
          } else
            setSnackbarInfo({
              open: true,
              message: "Task is frozen",
              variant: "error",
            });
        },
      });
    }
  }

  const setNotes = (taskData, annotations) => {
    if (annotations && Array.isArray(annotations) && annotations.length > 0) {
      let reviewerAnnotations = annotations.filter(
        (annotation) => !!annotation.parent_annotation
      );
      if (reviewerAnnotations.length > 0) {
        let correctAnnotation = reviewerAnnotations.find(
          (annotation) => annotation.id === taskData.correct_annotation
        );
        if (correctAnnotation) {
          reviewNotesRef.current.value = correctAnnotation.review_notes ?? "";
          annotationNotesRef.current.value =
            annotations.find(
              (annotation) =>
                annotation.id === correctAnnotation.parent_annotation
            )?.annotation_notes ?? "";
        } else {
          reviewNotesRef.current.value =
            reviewerAnnotations[0].review_notes ?? "";
          annotationNotesRef.current.value =
            annotations.find(
              (annotation) =>
                annotation.id === reviewerAnnotations[0].parent_annotation
            )?.annotation_notes ?? "";
        }
      } else {
        let normalAnnotation = annotations.find(
          (annotation) => !annotation.parent_annotation
        );
        annotationNotesRef.current.value =
          normalAnnotation.annotation_notes ?? "";
        reviewNotesRef.current.value = normalAnnotation.review_notes ?? "";
      }
    }
  };

  // we're running an effect on component mount and rendering LSF inside rootRef node
  useEffect(() => {
    if (localStorage.getItem("rtl") === "true") {
      var style = document.createElement("style");
      style.innerHTML = "input, textarea { direction: RTL; }";
      document.head.appendChild(style);
    }
    if (userData?.id && loaded.current !== taskId) {
      loaded.current = taskId;
      getProjectsandTasks(projectId, taskId).then(
        ([labelConfig, taskData, annotations, predictions]) => {
          // both have loaded!
          // console.log("[labelConfig, taskData, annotations, predictions]", [
          //   labelConfig,
          //   taskData,
          //   annotations,
          //   predictions,
          // ]);
          setNotes(taskData, annotations);
          let tempLabelConfig =
            labelConfig.project_type === "ConversationTranslation" ||
            labelConfig.project_type === "ConversationTranslationEditing"
              ? generateLabelConfig(taskData.data)
              : labelConfig.label_config;
          setLabelConfig(tempLabelConfig);
          setTaskData(taskData);
          getTaskData(taskData);
          LSFRoot(
            rootRef,
            lsfRef,
            userData,
            projectId,
            taskData,
            tempLabelConfig,
            annotations,
            predictions,
            annotationNotesRef,
            reviewNotesRef,
            labelConfig.project_type
          );
          hideLoader();
        }
      );
    }


    // Traversing and tab formatting --------------------------- end
  }, [labelConfig, userData, annotationNotesRef, reviewNotesRef, taskId]);

  useEffect(() => {
    showLoader();
  }, [taskId]);

  const onNextAnnotation = async () => {
    showLoader();
    getNextProject(projectId, taskId, "supercheck").then((res) => {
      hideLoader();
      // window.location.href = `/projects/${projectId}/task/${res.id}`;
      tasksComplete(res?.id || null);
    });
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRejectClick = async () => {
    review_status.current = "rejected";
    lsfRef.current.store.submitAnnotation();
  };

  const handleAcceptClick = async (status) => {
    review_status.current = status;
    lsfRef.current.store.submitAnnotation();
    handleClose();
  };

  const renderSnackBar = () => {
    return (
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={() =>
          setSnackbarInfo({ open: false, message: "", variant: "" })
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant={snackbar.variant}
        message={snackbar.message}
        autoHideDuration={2000}
      />
    );
  };

  return (
    <div>
      {!loader && (
        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          className="lsf-controls"
        >
          <div />
          <div>
            <Tooltip title="Go to next task">
              <Button
                type="default"
                onClick={onNextAnnotation}
                style={{
                  minWidth: "160px",
                  border: "1px solid #e6e6e6",
                  color: "#1890ff",
                  pt: 3,
                  pb: 3,
                  borderBottom: "None",
                }}
                className="lsf-button"
              >
                Next
              </Button>
            </Tooltip>
            {taskData?.super_check_user === userData?.id && (
              <Tooltip title="Save task for later">
                <Button
                  type="default"
                  onClick={() => handleAcceptClick("draft")}
                  style={{
                    minWidth: "160px",
                    border: "1px solid #e6e6e6",
                    color: "#e80",
                    pt: 3,
                    pb: 3,
                    borderBottom: "None",
                  }}
                  className="lsf-button"
                >
                  Draft
                </Button>
              </Tooltip>
            )}
            {taskData?.super_check_user === userData?.id && (
              <Tooltip title="Reject">
                <Button
                  value="Reject"
                  type="default"
                  onClick={handleRejectClick}
                  style={{
                    minWidth: "160px",
                    border: "1px solid #e6e6e6",
                    color: "#f5222d",
                    pt: 3,
                    pb: 3,
                    borderBottom: "None",
                    borderLeft: "None",
                  }}
                  className="lsf-button"
                >
                 Reject
                </Button>
              </Tooltip>
            )}
            {taskData?.super_check_user === userData?.id && (
              <Tooltip title="Validate">
                <Button
                  id="accept-button"
                  value="Validate"
                  type="default"
                  aria-controls={open ? "accept-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  style={{
                    minWidth: "160px",
                    border: "1px solid #e6e6e6",
                    color: "#52c41a",
                    pt: 3,
                    pb: 3,
                    borderBottom: "None",
                    borderLeft: "None",
                  }}
                  className="lsf-button"
                  onClick={handleClick}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                 Validate
                </Button>
              </Tooltip>
            )}
            <StyledMenu
              id="accept-menu"
              MenuListProps={{
                "aria-labelledby": "accept-button",
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => handleAcceptClick("validated")}
                disableRipple
              >
                Validated No Changes
              </MenuItem>
              <MenuItem
                onClick={() => handleAcceptClick("validated_with_changes")}
                disableRipple
              >
                Validated with Changes
              </MenuItem>
            </StyledMenu>
          </div>
        </div>
      )}
      <Box sx={{ border: "1px solid rgb(224 224 224)" }}>
        <div className="label-studio-root" ref={rootRef}></div>
        <Popover
          id={"'simple-popover'"}
          open={Boolean(showTagSuggestionsAnchorEl)}
          anchorEl={showTagSuggestionsAnchorEl}
          onClose={() => {
            setShowTagSuggestionsAnchorEl(null);
            setTagSuggestionList(null);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          {tagSuggestionList}
        </Popover>
      </Box>
      {loader}
      {renderSnackBar()}
    </div>
  );
};

export default function LSF() {
  const [showNotes, setShowNotes] = useState(false);
  const [taskData, setTaskData] = useState([]);
  const [showGlossary, setShowGlossary] = useState(false);
  const annotationNotesRef = useRef(null);
  const reviewNotesRef = useRef(null);
  const { taskId } = useParams();
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    variant: "info"
  })
  // const [notesValue, setNotesValue] = useState('');
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loader, showLoader, hideLoader] = useFullPageLoader();
  const ProjectDetails = useSelector((state) => state.getProjectDetails.data);

  const handleTagChange = (event, value, reason) => {
    if (reason === "selectOption") {
      setSelectedTag(value);
      let copyValue = `[${value}]`;
      navigator.clipboard.writeText(copyValue);
      setAlertData({ open: true, message: `Tag ${copyValue} copied to clipboard`, variant: "info" });
    }
  }

  useEffect(()=>{
    if(ProjectDetails?.project_type && ProjectDetails?.project_type.toLowerCase().includes("audio")){
      setShowTagsInput(true);
    }
  }, [ProjectDetails])

  const handleCollapseClick = () => {
    setShowNotes(!showNotes);
  };

  const resetNotes = () => {
    setShowNotes(false);
    reviewNotesRef.current.value = "";
  };

  useEffect(() => {
    resetNotes();
  }, [taskId]);

  const getTaskData = (taskData) => {
    setTaskData(taskData);
  };
  const handleGlossaryClick = () => {
    setShowGlossary(!showGlossary);
  };

  return (
    <div style={{ maxHeight: "100%", maxWidth: "90%", margin: "auto" }}>
      {!loader && (
        <Button
          value="Back to Project"
          startIcon={<ArrowBackIcon />}
          variant="contained"
          color="primary"
          onClick={() => {
            localStorage.removeItem("labelAll");
            navigate(`/projects/${projectId}`);
            //window.location.replace(`/#/projects/${projectId}`);
            //window.location.reload();
          }}
        >
          Back to Project
        </Button>
      )}
      <Card
        sx={{
          minHeight: 500,
          padding: 5,
          mt: 3,
          pt: 3,
        }}
      >
        <div
          style={{
            display: "flow-root",
            marginBottom: "30px"
          }}
        >
        {!loader && (
          <Button
            endIcon={showNotes ? <ArrowRightIcon /> : <ArrowDropDownIcon />}
            variant="contained"
            color={
              annotationNotesRef.current?.value !== "" ? "success" : "primary"
            }
            onClick={handleCollapseClick}
          >
            Notes {annotationNotesRef.current?.value !== "" && "*"}
          </Button>
        )}
        <div
          className={styles.collapse}
          style={{
            display: showNotes ? "block" : "none",
            paddingBottom: "16px",
          }}
        >
          {/* <Alert severity="warning" showIcon style={{marginBottom: '1%'}}>
              {translate("alert.notes")}
          </Alert> */}
          <TextField
            multiline
            placeholder="Place your remarks here ..."
            label="Annotation Notes"
            // value={notesValue}
            // onChange={event=>setNotesValue(event.target.value)}
            inputRef={annotationNotesRef}
            rows={2}
            maxRows={4}
            inputProps={{
              style: { fontSize: "1rem" },
              readOnly: true,
            }}
            style={{ width: "99%", marginTop: "1%" }}
          />
          <TextField
            multiline
            placeholder="Place your remarks here ..."
            label="Review Notes"
            // value={notesValue}
            // onChange={event=>setNotesValue(event.target.value)}
            inputRef={reviewNotesRef}
            rows={2}
            maxRows={4}
            inputProps={{
              style: { fontSize: "1rem" },
            }}
            style={{ width: "99%", marginTop: "1%" }}
          />
        </div>
        <Button
          variant="contained"
          style={{ marginLeft: "10px" }}
          endIcon={showGlossary ? <ArrowRightIcon /> : <ArrowDropDownIcon />}
          onClick={handleGlossaryClick}
        >
          Glossary
        </Button>
        <div
          style={{
            display: showGlossary ? "block" : "none",
            paddingBottom: "16px",
            paddingTop: "10px",
          }}
        >
          <Glossary taskData={taskData} />
        </div>
        {showTagsInput &&
          <div
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Autocomplete
              id="demo"
              value={selectedTag}
              onChange={handleTagChange}
              options={TabsSuggestionData}
              size={"small"}
              getOptionLabel={(option) => option}
              sx={{ width: 200, display: "inline-flex", marginLeft: "10px", marginRight: "10px" }}
              renderInput={(params) => <TextField {...params} label="Select Noise Tag"
                placeholder="Select Noise Tag"
                style={{ fontSize: "14px" }}
              />}
              renderOption={(props, option, state) => {
                return <MenuItem {...props}>{option}</MenuItem>
              }}

            />
            <Tooltip title="Select the appropriate noise tag which can be linked to a selected audio region. Selecting the tag copies the value, which can be pasted in respective location of the transcription." placement="right">
              <InfoIcon color="primary" />
            </Tooltip>
          </div>}
          </div>
        <CustomizedSnackbars
          open={alertData.open}
          handleClose={() => setAlertData({...alertData, open: false })}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          variant={alertData.variant}
          message={alertData.message}
        />
        <LabelStudioWrapper
          getTaskData={getTaskData}
          resetNotes={() => resetNotes()}
          reviewNotesRef={reviewNotesRef}
          annotationNotesRef={annotationNotesRef}
          loader={loader}
          showLoader={showLoader}
          hideLoader={hideLoader}
        />
      </Card>
    </div>
  );
}

LabelStudioWrapper.propTypes = PropTypes.object;
