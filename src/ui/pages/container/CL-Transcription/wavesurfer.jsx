import { useEffect, useRef, memo, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "../../../../../node_modules/wavesurfer.js/dist/plugins/regions.esm.js";
import Minimap from "../../../../../node_modules/wavesurfer.js/dist/plugins/minimap.esm.js";
import TimelinePlugin from '../../../../../node_modules/wavesurfer.js/dist/plugins/timeline.esm.js';
import { useSelector, useDispatch } from "react-redux";
import { setSubtitles } from "../../../../redux/actions/Common";
import C from "../../../../redux/constants";
import DT from "duration-time-conversion";

const Timeline2 = ({ details, waveformSettings }) => {
  const waveSurf = useRef(null);
  const regions = useRef(null);
  const result = useSelector((state) => state.commonReducer?.subtitles);
  const player = useSelector((state) => state.commonReducer?.player);
  const [currentSubs, setCurrentSubs] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (result) {
      setCurrentSubs(result);
    }
  }, [result]);

  useEffect(() => {
    if (details?.data?.audio_url !== undefined && waveSurf.current === null) {
      waveSurf.current = WaveSurfer.create({
        container: document.querySelector('#waveform'),
        height: waveformSettings.height,
        width: waveformSettings.width,
        waveColor: waveformSettings.waveColor,
        progressColor: waveformSettings.progressColor,
        barWidth: waveformSettings.barWidth,
        minPxPerSec: waveformSettings.minPxPerSec,
        cursorColor: waveformSettings.cursorColor,
        cursorWidth: waveformSettings.cursorWidth,
        barGap: waveformSettings.barGap,
        barRadius: waveformSettings.barRadius,
        barHeight: waveformSettings.barHeight,
        mediaControls: true,
        url: details?.data?.audio_url,
        hideScrollbar: true,
        media: document.querySelector('audio'),
        plugins: [
          Minimap.create({
            height: 20,
            waveColor: '#ddd',
            progressColor: '#999',
            insertPosition: 'beforeBegin',
          }),
          TimelinePlugin.create({
          }),
        ],
      });
      regions.current = waveSurf.current.registerPlugin(RegionsPlugin.create());
    }
  }, [details])

  useEffect(() => {
    if (details?.data?.audio_url !== undefined && waveSurf.current !== null) {
      waveSurf.current.destroy();
      waveSurf.current = WaveSurfer.create({
        container: document.querySelector('#waveform'),
        height: waveformSettings.height,
        waveColor: waveformSettings.waveColor,
        progressColor: waveformSettings.progressColor,
        barWidth: waveformSettings.barWidth,
        minPxPerSec: waveformSettings.minPxPerSec,
        cursorColor: waveformSettings.cursorColor,
        cursorWidth: waveformSettings.cursorWidth,
        barGap: waveformSettings.barGap,
        barRadius: waveformSettings.barRadius,
        barHeight: waveformSettings.barHeight,
        mediaControls: true,
        url: details?.data?.audio_url,
        hideScrollbar: true,
        media: document.querySelector('audio'),
        plugins: [
          Minimap.create({
            height: 20,
            waveColor: '#ddd',
            progressColor: '#999',
            insertPosition: 'beforeBegin',
          }),
          TimelinePlugin.create({
          }),
        ],
      });
      regions.current = waveSurf.current.registerPlugin(RegionsPlugin.create());
      if (currentSubs){
        waveSurf.current.on('decode', () => {
            currentSubs?.map((sub, key) => {
              regions.current.addRegion({
                start: sub.startTime,
                end: sub.endTime,
                content: sub.text,
                drag: false,
                resize: true,
              })
            })
        })
      }
    }
  }, [waveformSettings])

  useEffect(() => {
    if (details?.data !== undefined && waveSurf.current !== null) {
      regions.current.clearRegions();
      currentSubs?.map((sub, key) => {
        regions.current.addRegion({
          id: sub.id,
          start: sub.startTime,
          end: sub.endTime,
          content: sub.text,
          drag: false,
          resize: true,
          contentEditable: true,
          color: sub.speaker_id === "Speaker 1"
          ? "rgb(0, 87, 158, 0.2)"
          : sub.speaker_id === "Speaker 0"
          ? "rgb(123, 29, 0, 0.2)"
          : "rgb(0, 0, 0, 0.6)",
        })
      })
    }
  }, [details, currentSubs])

  if (waveSurf !== null && regions.current !== null) {
    let activeRegion = null
    regions.current.on('region-out', (region) => {
      if (activeRegion === region) {
        waveSurf.current.pause();
        activeRegion = null;
      }
    })
    regions.current.on('region-double-clicked', (region, e) => {
      e.stopPropagation();
      activeRegion = region;
      region.play();
    })
    waveSurf.current.on('interaction', () => {
      activeRegion = null;
    })
  }

  const updateSub = useCallback((currentSubsCopy) => {
    dispatch(setSubtitles(currentSubsCopy, C.SUBTITLES));
  }, [dispatch]);

  if (waveSurf !== null && regions.current !== null) {
    regions.current.on('region-updated', (region) => {
      let currentSubsCopy = currentSubs;
      currentSubsCopy[region.id -1].text = region?.content?.innerHTML;
      currentSubsCopy[region.id -1].start_time = DT.d2t(region.start);
      currentSubsCopy[region.id -1].end_time = DT.d2t(region.end);
      updateSub(currentSubsCopy);
      player.play();
    })
  }

  return (
      <>
        <div style={{ paddingLeft: "20px", paddingRight: "20px" }} id="waveform"></div>
      </>
  );
};


export default memo(Timeline2);