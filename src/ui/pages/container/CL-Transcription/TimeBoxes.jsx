import React, { memo, useState, useEffect, useRef } from "react";
import AudioTranscriptionLandingStyle from "../../../styles/AudioTranscriptionLandingStyle";
import { Box, TextField } from "@mui/material";

const TimeBoxes = ({ handleTimeChange, time, index, type }) => {
  const classes = AudioTranscriptionLandingStyle();
  
  // Parse time values safely
  const timeParts = time.split(":");
  const hours = timeParts[0] || "00";
  const minutes = timeParts[1] || "00";
  
  const secondsParts = (timeParts[2] || "00.000").split(".");
  const seconds = secondsParts[0] || "00";
  const milliseconds = secondsParts[1] || "000";

  // Store the original time value from props
  const originalTimeRef = useRef(time);
  
  // Local state to track input values
  const [localHours, setLocalHours] = useState(hours);
  const [localMinutes, setLocalMinutes] = useState(minutes);
  const [localSeconds, setLocalSeconds] = useState(seconds);
  const [localMilliseconds, setLocalMilliseconds] = useState(milliseconds);

  // Format display values with padding
  const displayHours = String(parseInt(localHours, 10) || 0).padStart(2, '0');
  const displayMinutes = String(parseInt(localMinutes, 10) || 0).padStart(2, '0');
  const displaySeconds = String(parseInt(localSeconds, 10) || 0).padStart(2, '0');
  const displayMilliseconds = String(parseInt(localMilliseconds, 10) || 0).padStart(3, '0');

  // Update original ref when time prop changes
  useEffect(() => {
    originalTimeRef.current = time;
  }, [time]);

  // Store the original input value when focusing
  const focusValueRef = useRef("");
  
  // Flag to prevent double callbacks when Enter triggers both keypress and blur
  const handledByEnterRef = useRef(false);

  // Function to handle focus events
  const handleFocus = (event, timeUnit) => {
    // Reset the Enter handling flag
    handledByEnterRef.current = false;
    
    // Store the original value when focusing
    focusValueRef.current = event.target.value;
    event.target.select();
  };

  // Handle local change without triggering parent callback
  const handleLocalChange = (event, timeUnit) => {
    // Get the value directly from the event
    const value = event.target.value;
    
    // Clean the value (convert to number and back to string to remove leading zeros)
    const cleanValue = value !== "0" && value !== "" ? String(parseInt(value, 10) || 0) : value;
    
    // Update local state
    switch (timeUnit) {
      case "hours":
        setLocalHours(cleanValue);
        break;
      case "minutes":
        setLocalMinutes(cleanValue);
        break;
      case "seconds":
        setLocalSeconds(cleanValue);
        break;
      case "miliseconds":
        setLocalMilliseconds(cleanValue);
        break;
      default:
        break;
    }
  };
  
  // Handle key press - only trigger callback on Enter
  const handleKeyPress = (event, timeUnit) => {
    if (event.key === 'Enter') {
      let value;
      let currentDisplayValue;
      
      switch (timeUnit) {
        case "hours":
          value = localHours;
          currentDisplayValue = displayHours;
          break;
        case "minutes":
          value = localMinutes;
          currentDisplayValue = displayMinutes;
          break;
        case "seconds":
          value = localSeconds;
          currentDisplayValue = displaySeconds;
          break;
        case "miliseconds":
          value = localMilliseconds;
          currentDisplayValue = displayMilliseconds;
          break;
        default:
          return;
      }
      
      // Only trigger parent callback if value actually changed
      if (currentDisplayValue !== focusValueRef.current) {
        // Set flag to indicate that Enter has handled this update
        handledByEnterRef.current = true;
        
        // Call parent callback with current value
        const prevTime = originalTimeRef.current;
        handleTimeChange(value, index, type, timeUnit);
        
        // Check if time prop changed after callback
        setTimeout(() => {
          if (originalTimeRef.current === prevTime) {
            // If time didn't change, reset to original values
            resetToOriginalValues();
          }
        }, 0);
      }
      
      // Remove focus from the input field
      event.target.blur();
    }
  };

  // Handle blur event to ensure we update parent with valid values
  const handleBlur = (timeUnit) => {
    // Skip if this blur event was triggered by Enter key
    if (handledByEnterRef.current) {
      // Reset the flag for next time
      handledByEnterRef.current = false;
      return;
    }
    
    let value;
    let currentDisplayValue;
    
    switch (timeUnit) {
      case "hours":
        value = localHours;
        currentDisplayValue = displayHours;
        break;
      case "minutes":
        value = localMinutes;
        currentDisplayValue = displayMinutes;
        break;
      case "seconds":
        value = localSeconds;
        currentDisplayValue = displaySeconds;
        break;
      case "miliseconds":
        value = localMilliseconds;
        currentDisplayValue = displayMilliseconds;
        break;
      default:
        return;
    }
    
    // Only trigger parent callback if value actually changed
    if (currentDisplayValue !== focusValueRef.current) {
      // Store original time before update
      const prevTime = originalTimeRef.current;
      
      // Update parent on blur only if value changed
      handleTimeChange(value, index, type, timeUnit);
      
      // Check if time prop changed after callback
      setTimeout(() => {
        if (originalTimeRef.current === prevTime) {
          // If time didn't change, reset to original values
          resetToOriginalValues();
        }
      }, 0);
    }
  };

  // Function to reset local values to original time
  const resetToOriginalValues = () => {
    const originalTimeParts = originalTimeRef.current.split(":");
    const originalHours = originalTimeParts[0] || "00";
    const originalMinutes = originalTimeParts[1] || "00";
    
    const originalSecondsParts = (originalTimeParts[2] || "00.000").split(".");
    const originalSeconds = originalSecondsParts[0] || "00";
    const originalMilliseconds = originalSecondsParts[1] || "000";

    setLocalHours(originalHours);
    setLocalMinutes(originalMinutes);
    setLocalSeconds(originalSeconds);
    setLocalMilliseconds(originalMilliseconds);
  };

  return (
    <Box display="flex">
      <TextField
        variant="standard"
        onChange={(event) => handleLocalChange(event, "hours")}
        onKeyPress={(event) => handleKeyPress(event, "hours")}
        onBlur={() => handleBlur("hours")}
        value={displayHours}
        onFocus={(event) => handleFocus(event, "hours")}
        className={classes.timeInputBox}
        style={{
          paddingLeft: "10px",
          marginLeft: type === "endTime" ? "auto" : "",
        }}
        type="number"
      />
      <TextField
        variant="standard"
        value={":"}
        style={{ width: "2%" }}
        className={classes.timeInputBox}
      />
      <TextField
        variant="standard"
        value={displayMinutes}
        className={classes.timeInputBox}
        onFocus={(event) => handleFocus(event, "minutes")}
        InputProps={{ inputProps: { min: 0, max: 59 } }}
        onChange={(event) => handleLocalChange(event, "minutes")}
        onKeyPress={(event) => handleKeyPress(event, "minutes")}
        onBlur={() => handleBlur("minutes")}
        type="number"
      />
      <TextField
        variant="standard"
        value={":"}
        style={{ width: "2%" }}
        className={classes.timeInputBox}
      />
      <TextField
        variant="standard"
        value={displaySeconds}
        onFocus={(event) => handleFocus(event, "seconds")}
        InputProps={{ inputProps: { min: 0, max: 59 } }}
        className={classes.timeInputBox}
        onChange={(event) => handleLocalChange(event, "seconds")}
        onKeyPress={(event) => handleKeyPress(event, "seconds")}
        onBlur={() => handleBlur("seconds")}
        type="number"
      />
      <TextField
        variant="standard"
        value={"."}
        style={{ width: "2%" }}
        className={classes.timeInputBox}
      />
      <TextField
        variant="standard"
        value={displayMilliseconds}
        style={{ width: "20%", paddingRight: "10px" }}
        onFocus={(event) => handleFocus(event, "miliseconds")}
        InputProps={{ inputProps: { min: 0, max: 999 } }}
        className={classes.timeInputBox}
        onChange={(event) => handleLocalChange(event, "miliseconds")}
        onKeyPress={(event) => handleKeyPress(event, "miliseconds")}
        onBlur={() => handleBlur("miliseconds")}
        type="number"
      />
    </Box>
  );
};

export default memo(TimeBoxes);