export type Language = "am" | "ar" | "bn" | "be" | "bg" | "yue-hant" | "zh" | "zh-hant" | "fr" | "de" | "el" | "gu" | "he" | "hi" | "it" | "ja" | "kn" | "ml" | "mr" | "ne" | "or" | "fa" | "pt" | "pa" | "ru" | "sa" | "sr" | "si" | "es" | "ta" | "te" | "ti" | "uk" | "ur" | "vi";
export interface ReactTransliterateProps extends React.HTMLProps<HTMLInputElement | HTMLTextAreaElement> {
    /**
     * Component to render. You can pass components from your
     * component library as this prop. Default is `<input />`
     * @type React.ReactNode
     */
    renderComponent?: (props: any) => React.ReactNode;
    /**
     * Extra space between the caret and left of the helper
     * @type number
     */
    offsetX?: number;
    /**
     * Extra space between the top of the helper and bottom of the caret
     * @type number
     */
    offsetY?: number;
    /**
     * Classname passed to the container of the component
     */
    containerClassName?: string;
    /**
     * CSS styles object passed to the container
     */
    containerStyles?: React.CSSProperties;
    /**
     * CSS styles object passed to the active item `<li>` tag
     */
    activeItemStyles?: React.CSSProperties;
    /**
     * Maximum number of suggestions to show in helper
     */
    maxOptions?: number;
    /**
     * Language you want to transliterate. See the README for language codes
     */
    lang?: Language;
    /**
     * Listener for the current value from the component. `(text: string) => void`
     */
    onChangeText: (text: string) => void;
    /**
     * `value` prop to pass to the component
     */
    value: string;
    /**
     * Should the suggestions be visible on mobile devices since
     * keyboards like Gboard and Swiftkey support typing in multiple languages
     * @type boolean
     */
    hideSuggestionBoxOnMobileDevices?: boolean;
    /**
     * To be used when `hideSuggestionBoxOnMobileDevices` is true.
     * Suggestion box will not be shown below this device width
     * @type number
     */
    hideSuggestionBoxBreakpoint?: number;
    /**
     * Keys which when pressed, input the current selection to the textbox
     */
    triggerKeys?: string[];
    /**
     * Should the current selection be inserted when `blur` event occurs
     * @type boolean
     */
    insertCurrentSelectionOnBlur?: boolean;
    /**
     * Show current input as the last option in the suggestion box
     * @type boolean
     */
    showCurrentWordAsLastSuggestion?: boolean;
    /**
     * Control whether suggestions should be shown
     * @type boolean
     */
    enabled?: boolean;
    /**
     * Send modelId in url req
     * @type string
     */
    modelId?: string;
    /**
   * URL for data fetching
   * @type string
   */
    apiURL?: string;
}
export const TriggerKeys: {
    KEY_RETURN: string;
    KEY_ENTER: string;
    KEY_TAB: string;
    KEY_SPACE: string;
};
type Config = {
    numOptions?: number;
    showCurrentWordAsLastSuggestion?: boolean;
    lang?: Language;
};
export const getTransliterateSuggestions: (word: string, modelId: string, apiURL: string, config?: Config | undefined) => Promise<string[] | undefined>;
export const ReactTransliterate: ({ renderComponent, lang, offsetX, offsetY, onChange, onChangeText, onBlur, value, onKeyDown, containerClassName, containerStyles, activeItemStyles, maxOptions, hideSuggestionBoxOnMobileDevices, hideSuggestionBoxBreakpoint, triggerKeys, insertCurrentSelectionOnBlur, showCurrentWordAsLastSuggestion, enabled, modelId, apiURL, ...rest }: ReactTransliterateProps) => JSX.Element;

//# sourceMappingURL=types.d.ts.map
