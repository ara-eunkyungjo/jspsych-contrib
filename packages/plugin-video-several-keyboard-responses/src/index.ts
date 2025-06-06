import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "video-several-keyboard-responses",
  version: version,
  parameters: {
    /** Array of the video file(s) to play. Video can be provided in multiple file formats for better cross-browser support. */
    stimulus: {
      type: ParameterType.VIDEO,
      pretty_name: "Video",
      default: undefined,
      array: true,
    },
    /** Array containing the key(s) the participant is allowed to press to respond to the stimulus. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** The width of the video in pixels. */
    width: {
      type: ParameterType.INT,
      pretty_name: "Width",
      default: "",
    },
    /** The height of the video display in pixels. */
    height: {
      type: ParameterType.INT,
      pretty_name: "Height",
      default: "",
    },
    /** If true, the video will begin playing as soon as it has loaded. */
    autoplay: {
      type: ParameterType.BOOL,
      pretty_name: "Autoplay",
      default: true,
    },
    /** If true, the participant will be able to pause the video or move the playback to any point in the video. */
    controls: {
      type: ParameterType.BOOL,
      pretty_name: "Controls",
      default: false,
    },
    /** Time to start the clip. If null (default), video will start at the beginning of the file. */
    start: {
      type: ParameterType.FLOAT,
      pretty_name: "Start",
      default: null,
    },
    /** Time to stop the clip. If null (default), video will stop at the end of the file. */
    stop: {
      type: ParameterType.FLOAT,
      pretty_name: "Stop",
      default: null,
    },
    /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
    rate: {
      type: ParameterType.FLOAT,
      pretty_name: "Rate",
      default: 1,
    },
    /** If true, the trial will end immediately after the video finishes playing. */
    trial_ends_after_video: {
      type: ParameterType.BOOL,
      pretty_name: "End trial after video finishes",
      default: false,
    },
    /** How long to show trial before it ends. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /** If true, the trial will end when participant makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /** If true, then responses are allowed while the video is playing. If false, then the video must finish playing before a response is accepted. */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true,
    },
    /** If true, multiple responses are recorded. If false, only the first response will be recorded. */
    multiple_responses_allowed: {
      type: ParameterType.BOOL,
      pretty_name: "Multiple responses allowed",
      default: true,
    },
  },
  data: {
    /** An array of the response time in milliseconds for each key press from the participant.
     * The time is measured from when the stimulus first began playing until the participant's response. */
    rt: {
      type: ParameterType.INT,
      array: true,
    },
    /** The stimulus displayed to the participant. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /** An array of the keys that the participant pressed in order. */
    response: {
      type: ParameterType.STRING,
      array: true,
    },
    /** An array of the times in seconds that the keys were pressed relative to the start of the video. */
    video_time: {
      type: ParameterType.FLOAT,
      array: true,
    },
  },
};

type Info = typeof info;

/**
 * **video-several-keyboard-responses**
 *
 * jsPsych plugin for playing a video file and getting several keyboard responses, based on @see {@link https://www.jspsych.org/plugins/jspsych-video-several-keyboard-responses/ video-several-keyboard-responses plugin documentation on jspsych.org}
 *
 * @author marianylund
 * @see {@link https://www.jspsych.org/plugins/jspsych-video-several-keyboard-responses/ video-several-keyboard-responses plugin documentation on jspsych.org}
 */
class VideoSeveralKeyboardResponsesPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // catch mistake where stimuli are not an array
    if (!Array.isArray(trial.stimulus)) {
      throw new Error(`
        The stimulus property for the video-several-keyboard-responses plugin must be an array
        of files. See https://www.jspsych.org/latest/plugins/video-several-keyboard-responses/#parameters
      `);
    }

    // setup stimulus
    var video_html = "<div>";
    video_html += '<video id="jspsych-video-several-keyboard-responses-stimulus"';

    if (trial.width) {
      video_html += ' width="' + trial.width + '"';
    }
    if (trial.height) {
      video_html += ' height="' + trial.height + '"';
    }
    if (trial.autoplay && trial.start == null) {
      // if autoplay is true and the start time is specified, then the video will start automatically
      // via the play() method, rather than the autoplay attribute, to prevent showing the first frame
      video_html += " autoplay ";
    }
    if (trial.controls) {
      video_html += " controls ";
    }
    if (trial.start !== null) {
      // hide video element when page loads if the start time is specified,
      // to prevent the video element from showing the first frame
      video_html += ' style="visibility: hidden;"';
    }
    video_html += ">";

    var video_preload_blob = this.jsPsych.pluginAPI.getVideoBuffer(trial.stimulus[0]);
    if (!video_preload_blob) {
      for (var i = 0; i < trial.stimulus.length; i++) {
        var file_name = trial.stimulus[i];
        if (file_name.indexOf("?") > -1) {
          file_name = file_name.substring(0, file_name.indexOf("?"));
        }
        var type = file_name.substr(file_name.lastIndexOf(".") + 1);
        type = type.toLowerCase();
        if (type == "mov") {
          console.warn(
            "Warning: video-several-keyboard-responses plugin does not reliably support .mov files."
          );
        }
        video_html += '<source src="' + file_name + '" type="video/' + type + '">';
      }
    }
    video_html += "</video>";
    video_html += "</div>";

    // add prompt if there is one
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }

    display_element.innerHTML = video_html;

    var video_element = display_element.querySelector<HTMLVideoElement>(
      "#jspsych-video-several-keyboard-responses-stimulus"
    );

    if (video_preload_blob) {
      video_element.src = video_preload_blob;
    }

    video_element.onended = () => {
      if (trial.trial_ends_after_video) {
        end_trial();
      }
      if (trial.response_allowed_while_playing == false && !trial.trial_ends_after_video) {
        // start keyboard listener
        var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false,
        });
      }
    };

    video_element.playbackRate = trial.rate;

    // if video start time is specified, hide the video and set the starting time
    // before showing and playing, so that the video doesn't automatically show the first frame
    if (trial.start !== null) {
      video_element.pause();
      video_element.onseeked = () => {
        video_element.style.visibility = "visible";
        video_element.muted = false;
        if (trial.autoplay) {
          video_element.play();
        } else {
          video_element.pause();
        }
        video_element.onseeked = () => {};
      };
      video_element.onplaying = () => {
        video_element.currentTime = trial.start;
        video_element.onplaying = () => {};
      };
      // fix for iOS/MacOS browsers: videos aren't seekable until they start playing, so need to hide/mute, play,
      // change current time, then show/unmute
      video_element.muted = true;
      video_element.play();
    }

    let stopped = false;
    if (trial.stop !== null) {
      video_element.addEventListener("timeupdate", (e) => {
        var currenttime = video_element.currentTime;
        if (currenttime >= trial.stop) {
          if (!trial.response_allowed_while_playing) {
            var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: after_response,
              valid_responses: trial.choices,
              rt_method: "performance",
              persist: false,
              allow_held_key: false,
            });
          }
          video_element.pause();
          if (trial.trial_ends_after_video && !stopped) {
            // this is to prevent end_trial from being called twice, because the timeupdate event
            // can fire in quick succession
            stopped = true;
            end_trial();
          }
        }
      });
    }

    // store response
    var response = {
      rt: null,
      key: null,
      video_time: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // kill keyboard listeners
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // stop the video file if it is playing
      // remove end event listeners if they exist
      display_element
        .querySelector<HTMLVideoElement>("#jspsych-video-several-keyboard-responses-stimulus")
        .pause();
      display_element.querySelector<HTMLVideoElement>(
        "#jspsych-video-several-keyboard-responses-stimulus"
      ).onended = () => {};

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
        video_time: response.video_time,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the participant
    var after_response = (info) => {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector(
        "#jspsych-video-several-keyboard-responses-stimulus"
      ).className += " responded";

      if (response.key == null) {
        response = { rt: [info.rt], key: [info.key], video_time: [video_element.currentTime] };
      } else if (trial.multiple_responses_allowed) {
        response.rt.push(info.rt);
        response.key.push(info.key);
        response.video_time.push(video_element.currentTime);
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != "NO_KEYS" && trial.response_allowed_while_playing) {
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: trial.multiple_responses_allowed,
        allow_held_key: false,
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    const video_element = display_element.querySelector<HTMLVideoElement>(
      "#jspsych-video-button-response-stimulus"
    );

    const respond = () => {
      if (data.rt !== null) {
        for (let i = 0; i < data.rt.length; i++) {
          this.jsPsych.pluginAPI.pressKey(data.response[i], data.rt[i]);
        }
      }
    };

    if (!trial.response_allowed_while_playing) {
      video_element.addEventListener("ended", respond);
    } else {
      respond();
    }
  }

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
    let n_responses = this.jsPsych.randomization.randomInt(1, 5);
    if (!trial.multiple_responses_allowed) {
      n_responses = 1;
    }

    const rts = [];
    const responses = [];
    let last_rt = 0;
    for (let i = 0; i < n_responses; i++) {
      const rt = Math.round(this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true));
      rts.push(rt + last_rt);
      last_rt = rt;
      responses.push(this.jsPsych.pluginAPI.getValidKey(trial.choices));
    }

    const default_data = {
      stimulus: trial.stimulus,
      response: responses,
      rt: rts,
      video_time: rts,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    //this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }
}

export default VideoSeveralKeyboardResponsesPlugin;
