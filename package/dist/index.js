require("./index.css");
var $dWhh5$reactjsxruntime = require("react/jsx-runtime");
var $dWhh5$react = require("react");
var $dWhh5$textareacaret = require("textarea-caret");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "ReactTransliterate", () => $3f93eb6d5bf69cb7$export$b7fa6c785ac95e64);
$parcel$export(module.exports, "TriggerKeys", () => $9090cd5fdacb9284$export$24b0ea3375909d37);
$parcel$export(module.exports, "getTransliterateSuggestions", () => $ad7f01abe8daa1b6$export$27f30d10c00bcc6c);



function $6a2317d46b969b19$export$e27e3030245d4c9b() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}


function $0aa7a794db13c851$export$8a4ff65f970d59a5(el) {
    const start = 0;
    const end = 0;
    if (!el) return {
        start: start,
        end: end
    };
    if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") return {
        start: el.selectionStart,
        end: el.selectionEnd
    };
    return {
        start: start,
        end: end
    };
}
function $0aa7a794db13c851$export$97ab23b40042f8af(elem, caretPos) {
    if (elem) {
        if (elem.selectionStart) {
            elem.focus();
            elem.setSelectionRange(caretPos, caretPos);
        } else elem.focus();
    }
}





var $479169a4406ef977$exports = {};

$parcel$export($479169a4406ef977$exports, "Active", () => $479169a4406ef977$export$c3c7cbf43a3f0561, (v) => $479169a4406ef977$export$c3c7cbf43a3f0561 = v);
$parcel$export($479169a4406ef977$exports, "ReactTransliterate", () => $479169a4406ef977$export$b7fa6c785ac95e64, (v) => $479169a4406ef977$export$b7fa6c785ac95e64 = v);
var $479169a4406ef977$export$c3c7cbf43a3f0561;
var $479169a4406ef977$export$b7fa6c785ac95e64;
$479169a4406ef977$export$c3c7cbf43a3f0561 = `vNSxFa_Active`;
$479169a4406ef977$export$b7fa6c785ac95e64 = `vNSxFa_ReactTransliterate`;


const $9090cd5fdacb9284$export$24b0ea3375909d37 = {
    KEY_RETURN: "Enter",
    KEY_ENTER: "Enter",
    KEY_TAB: "Tab",
    KEY_SPACE: " "
};


const $ad7f01abe8daa1b6$export$27f30d10c00bcc6c = async (word, modelId, apiURL, config)=>{
    const { numOptions: numOptions , showCurrentWordAsLastSuggestion: showCurrentWordAsLastSuggestion , lang: lang  } = config || {
        numOptions: 5,
        showCurrentWordAsLastSuggestion: true,
        lang: "hi"
    };
    // fetch suggestion from api
    // const url = `https://www.google.com/inputtools/request?ime=transliteration_en_${lang}&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&text=${word}`;
    var myHeaders = new Headers();
    const postData = JSON.stringify({
        "modelId": `${modelId}`,
        "input": [
            {
                "source": `${word}`
            }
        ]
    });
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
        method: 'GET'
    };
    try {
        const res = await fetch(apiURL + `/${word}`, requestOptions);
        const data = await res.json();
        // console.log("library data", data);
        if (data && data.result.length > 0) {
            const found = showCurrentWordAsLastSuggestion ? [
                ...data.result,
                word
            ] : data.result;
            return found;
        } else {
            if (showCurrentWordAsLastSuggestion) return [
                word
            ];
            return [];
        }
    } catch (e) {
        // catch error
        console.error("There was an error with transliteration", e);
        return [];
    }
};


const $3f93eb6d5bf69cb7$var$KEY_UP = "ArrowUp";
const $3f93eb6d5bf69cb7$var$KEY_DOWN = "ArrowDown";
const $3f93eb6d5bf69cb7$var$KEY_ESCAPE = "Escape";
const $3f93eb6d5bf69cb7$var$OPTION_LIST_Y_OFFSET = 10;
const $3f93eb6d5bf69cb7$var$OPTION_LIST_MIN_WIDTH = 100;
const $3f93eb6d5bf69cb7$export$b7fa6c785ac95e64 = ({ renderComponent: renderComponent = (props)=>/*#__PURE__*/ $dWhh5$reactjsxruntime.jsx("input", {
        ...props
    })
 , lang: lang = "hi" , offsetX: offsetX = 0 , offsetY: offsetY = 10 , onChange: onChange , onChangeText: onChangeText , onBlur: onBlur , value: value1 , onKeyDown: onKeyDown , containerClassName: containerClassName = "" , containerStyles: containerStyles = {} , activeItemStyles: activeItemStyles = {} , maxOptions: maxOptions = 5 , hideSuggestionBoxOnMobileDevices: hideSuggestionBoxOnMobileDevices = false , hideSuggestionBoxBreakpoint: hideSuggestionBoxBreakpoint = 450 , triggerKeys: triggerKeys = [
    $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_SPACE,
    $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_ENTER,
    $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_RETURN,
    $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_TAB, 
] , insertCurrentSelectionOnBlur: insertCurrentSelectionOnBlur = true , showCurrentWordAsLastSuggestion: showCurrentWordAsLastSuggestion = true , enabled: enabled = true , modelId: modelId = "" , apiURL: apiURL = "" , ...rest })=>{
    const [options, setOptions] = $dWhh5$react.useState([]);
    const [left1, setLeft] = $dWhh5$react.useState(0);
    const [top1, setTop] = $dWhh5$react.useState(0);
    const [selection, setSelection] = $dWhh5$react.useState(0);
    const [matchStart, setMatchStart] = $dWhh5$react.useState(-1);
    const [matchEnd, setMatchEnd] = $dWhh5$react.useState(-1);
    const inputRef = $dWhh5$react.useRef(null);
    const [windowSize, setWindowSize] = $dWhh5$react.useState({
        width: 0,
        height: 0
    });
    const shouldRenderSuggestions = $dWhh5$react.useMemo(()=>hideSuggestionBoxOnMobileDevices ? windowSize.width > hideSuggestionBoxBreakpoint : true
    , [
        windowSize,
        hideSuggestionBoxBreakpoint,
        hideSuggestionBoxOnMobileDevices
    ]);
    const reset = ()=>{
        // reset the component
        setSelection(0);
        setOptions([]);
    };
    const handleSelection = (index)=>{
        var ref;
        const currentString = value1;
        // create a new string with the currently typed word
        // replaced with the word in transliterated language
        const newValue = currentString.substring(0, matchStart) + options[index] + " " + currentString.substring(matchEnd + 1, currentString.length);
        // set the position of the caret (cursor) one character after the
        // the position of the new word
        setTimeout(()=>{
            $0aa7a794db13c851$export$97ab23b40042f8af(// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            inputRef.current, matchStart + options[index].length + 1);
        }, 1);
        // bubble up event to the parent component
        const e = {
            target: {
                value: newValue
            }
        };
        onChangeText(newValue);
        onChange && onChange(e);
        reset();
        return (ref = inputRef.current) === null || ref === void 0 ? void 0 : ref.focus();
    };
    const renderSuggestions = async (lastWord)=>{
        if (!shouldRenderSuggestions) return;
        // fetch suggestion from api
        // const url = `https://www.google.com/inputtools/request?ime=transliteration_en_${lang}&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&text=${lastWord}`;
        const numOptions = showCurrentWordAsLastSuggestion ? maxOptions - 1 : maxOptions;
        const data = await $ad7f01abe8daa1b6$export$27f30d10c00bcc6c(lastWord, modelId, apiURL, {
            numOptions: numOptions,
            showCurrentWordAsLastSuggestion: showCurrentWordAsLastSuggestion,
            lang: lang
        });
        setOptions(data ? data : []);
    };
    const handleChange = (e)=>{
        const value = e.currentTarget.value;
        // bubble up event to the parent component
        onChange && onChange(e);
        onChangeText(value);
        if (!shouldRenderSuggestions) return;
        // get the current index of the cursor
        const caret = $0aa7a794db13c851$export$8a4ff65f970d59a5(e.target).end;
        const input = inputRef.current;
        if (!input) return;
        const caretPos = ($parcel$interopDefault($dWhh5$textareacaret))(input, caret);
        // search for the last occurence of the space character from
        // the cursor
        const indexOfLastSpace = value.lastIndexOf(" ", caret - 1) < value.lastIndexOf("\n", caret - 1) ? value.lastIndexOf("\n", caret - 1) : value.lastIndexOf(" ", caret - 1);
        // first character of the currently being typed word is
        // one character after the space character
        // index of last character is one before the current position
        // of the caret
        setMatchStart(indexOfLastSpace + 1);
        setMatchEnd(caret - 1);
        // currentWord is the word that is being typed
        const currentWord = value.slice(indexOfLastSpace + 1, caret);
        if (currentWord && enabled) {
            // make an api call to fetch suggestions
            renderSuggestions(currentWord);
            const rect = input.getBoundingClientRect();
            // calculate new left and top of the suggestion list
            // minimum of the caret position in the text input and the
            // width of the text input
            const left = Math.min(caretPos.left, rect.width - $3f93eb6d5bf69cb7$var$OPTION_LIST_MIN_WIDTH / 2);
            // minimum of the caret position from the top of the input
            // and the height of the input
            const top = Math.min(caretPos.top + $3f93eb6d5bf69cb7$var$OPTION_LIST_Y_OFFSET, rect.height);
            setTop(top);
            setLeft(left);
        } else reset();
    };
    const handleKeyDown = (event)=>{
        const helperVisible = options.length > 0;
        if (helperVisible) {
            if (triggerKeys.includes(event.key)) {
                event.preventDefault();
                handleSelection(selection);
            } else switch(event.key){
                case $3f93eb6d5bf69cb7$var$KEY_ESCAPE:
                    event.preventDefault();
                    reset();
                    break;
                case $3f93eb6d5bf69cb7$var$KEY_UP:
                    event.preventDefault();
                    setSelection((options.length + selection - 1) % options.length);
                    break;
                case $3f93eb6d5bf69cb7$var$KEY_DOWN:
                    event.preventDefault();
                    setSelection((selection + 1) % options.length);
                    break;
                default:
                    onKeyDown && onKeyDown(event);
                    break;
            }
        } else onKeyDown && onKeyDown(event);
    };
    const handleBlur = (event)=>{
        if (!$6a2317d46b969b19$export$e27e3030245d4c9b()) {
            if (insertCurrentSelectionOnBlur && options[selection]) handleSelection(selection);
            else reset();
        }
        onBlur && onBlur(event);
    };
    const handleResize = ()=>{
        // TODO implement the resize function to resize
        // the helper on screen size change
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize({
            width: width,
            height: height
        });
    };
    $dWhh5$react.useEffect(()=>{
        window.addEventListener("resize", handleResize);
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize({
            width: width,
            height: height
        });
        return ()=>{
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return /*#__PURE__*/ $dWhh5$reactjsxruntime.jsxs("div", {
        // position relative is required to show the component
        // in the correct position
        style: {
            ...containerStyles,
            position: "relative"
        },
        className: containerClassName,
        children: [
            renderComponent({
                onChange: handleChange,
                onKeyDown: handleKeyDown,
                onBlur: handleBlur,
                ref: inputRef,
                value: value1,
                "data-testid": "rt-input-component",
                ...rest
            }),
            shouldRenderSuggestions && options.length > 0 && /*#__PURE__*/ $dWhh5$reactjsxruntime.jsx("ul", {
                style: {
                    left: `${left1 + offsetX}px`,
                    top: `${top1 + offsetY}px`,
                    position: "absolute",
                    width: "auto"
                },
                className: (/*@__PURE__*/$parcel$interopDefault($479169a4406ef977$exports)).ReactTransliterate,
                "data-testid": "rt-suggestions-list",
                children: Array.from(new Set(options)).map((item, index)=>/*#__PURE__*/ $dWhh5$reactjsxruntime.jsx("li", {
                        className: index === selection ? (/*@__PURE__*/$parcel$interopDefault($479169a4406ef977$exports)).Active : undefined,
                        style: index === selection ? activeItemStyles || {} : {},
                        onMouseEnter: ()=>{
                            setSelection(index);
                        },
                        onClick: ()=>handleSelection(index)
                        ,
                        children: item
                    }, item)
                )
            })
        ]
    });
};


//# sourceMappingURL=index.js.map
