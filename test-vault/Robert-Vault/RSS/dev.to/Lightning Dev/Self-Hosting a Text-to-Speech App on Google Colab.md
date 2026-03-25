---
title: Self-Hosting a Text-to-Speech App on Google Colab
link: https://dev.to/lightningdev123/self-hosting-a-text-to-speech-app-on-google-colab-1f2a
author: Lightning Developer
publish_date: 2025-12-19 05:37:44
saved_date: 2026-01-17 15:10:05
tags: #webdev #ai #productivity #pinggy
---


Text to speech has quietly moved from robotic-sounding demos to voices that feel natural and expressive. The problem is that good quality speech usually comes with usage limits or per-character pricing. Running modern models locally can also be difficult without a capable GPU. A practical middle ground is to use free cloud compute and host the app yourself.

In this article, we will build a complete text-to-speech web application using Google Colab, the Kokoro TTS model, a clean interface with Gradio, and public access through [Pinggy](https://pinggy.io/). Everything runs inside a Colab notebook and stays active as long as the session is alive.

## Why run text-to-speech on Colab

Most commercial TTS platforms charge by characters or audio length. That works for small projects but quickly becomes restrictive when experimenting or generating large amounts of audio.

Colab provides free access to a Tesla T4 GPU, which is more than enough for lightweight speech models. Even though Kokoro can run on CPU, GPU acceleration makes generation much faster and smoother, especially for longer text.

Colab notebooks are not publicly reachable by default. This is where [Pinggy](https://pinggy.io/) becomes useful. It creates a secure tunnel and exposes your local web app with a public URL. The result is a setup where you write code in a notebook, run a web app, and access it from any browser.  

## Getting started with the environment

Open a new notebook at colab.google.com.  
From the Runtime menu, change the runtime type and enable GPU. Choose T4 if available.

The first thing to install is [Pinggy](https://pinggy.io/), since the tunnel needs to be active before launching the web app.  

```
!pip install pinggy
```

Now start a tunnel that forwards traffic to the port where the app will run.  

```
import pinggy

tunnel = pinggy.start_tunnel(
    forwardto="localhost:5000"
)

print("Public URLs:", tunnel.urls)
```

Keep this URL handy. It will be used to open the application later.

## Installing text-to-speech dependencies

Next, install the libraries required for speech generation and the web interface.  

```
!pip install kokoro-onnx gradio soundfile torch numpy
```

Kokoro ONNX handles speech synthesis, Gradio builds the interface, and soundfile is used to save audio output.

## Understanding Kokoro TTS

Kokoro ONNX is based on the Kokoro 82M model and optimized for efficient inference. The model is relatively small, yet produces speech that sounds natural and clear.

It supports multiple languages such as English, Japanese, German, French, Spanish, Italian, Chinese, Korean, Portuguese, and Russian. Several voice styles are available, covering both male and female tones.

Because the model is lightweight, it fits comfortably within Colab memory limits and runs reliably on the free GPU tier.

## Core text-to-speech logic

The following code downloads the model files, loads Kokoro, and defines a function that converts text into speech.  

```
import soundfile as sf
import urllib.request
import tempfile
import uuid
import os
from kokoro_onnx import Kokoro

MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
model_path = "kokoro-v1.0.onnx"
voices_bin_path = "voices-v1.0.bin"

if not os.path.exists(model_path):
    urllib.request.urlretrieve(MODEL_URL + "kokoro-v1.0.onnx", model_path)

if not os.path.exists(voices_bin_path):
    urllib.request.urlretrieve(MODEL_URL + "voices-v1.0.bin", voices_bin_path)

kokoro = Kokoro(model_path, voices_bin_path)

voice_options = list(kokoro.voices.keys())

VOICE_LABELS = {v.replace("_", " ").title(): v for v in voice_options}

LANG_LABELS = {
    "English US": "en-us",
    "English UK": "en-gb",
    "Japanese": "ja-jp",
    "Chinese": "zh-cn",
    "German": "de-de",
    "Spanish": "es-es",
    "French": "fr-fr",
    "Italian": "it-it",
    "Korean": "ko-kr",
    "Portuguese": "pt-br",
    "Russian": "ru-ru",
}

def tts_generate(text, voice_label, speed, language):
    if not text.strip():
        return None, "Please enter text"

    voice_id = VOICE_LABELS[voice_label]
    lang_code = LANG_LABELS[language]

    samples, sr = kokoro.create(
        text=text,
        voice=voice_id,
        speed=float(speed),
        lang=lang_code
    )

    filename = f"tts_{uuid.uuid4().hex[:8]}.wav"
    path = os.path.join(tempfile.gettempdir(), filename)
    sf.write(path, samples, sr)

    return path, "Audio generated"
```

This function takes text input along with voice, speed, and language, then returns a playable audio file.

## Building the web interface with Gradio

Gradio allows us to turn the TTS function into a usable web app with very little code.  

```
import gradio as gr

def build_ui():
    with gr.Blocks(title="Text to Speech AI") as app:
        gr.Markdown("### Text to Speech AI")

        text_input = gr.Textbox(
            label="Text",
            placeholder="Enter text here",
            lines=4
        )

        with gr.Row():
            voice_dropdown = gr.Dropdown(
                label="Voice",
                choices=list(VOICE_LABELS.keys()),
                value=list(VOICE_LABELS.keys())[0]
            )
            language_dropdown = gr.Dropdown(
                label="Language",
                choices=list(LANG_LABELS.keys()),
                value="English US"
            )

        speed_slider = gr.Slider(
            minimum=0.5,
            maximum=2.0,
            value=1.0,
            step=0.1,
            label="Speed"
        )

        generate_btn = gr.Button("Generate Speech")

        audio_output = gr.Audio(label="Output")
        status_output = gr.Markdown()

        generate_btn.click(
            tts_generate,
            inputs=[text_input, voice_dropdown, speed_slider, language_dropdown],
            outputs=[audio_output, status_output]
        )

    return app

app = build_ui()
app.launch(server_name="0.0.0.0", server_port=5000, share=False)
```

Once this cell runs, the app starts listening on port `5000` inside the notebook.

## Accessing the app from your browser

Open the [Pinggy](https://pinggy.io/) URL printed earlier. You should see the text-to-speech interface.

Type some text, select a voice and language, adjust the speed if needed, and generate audio. The output can be played directly or downloaded as a WAV file.

## Voice and language tips

For the most natural results, match the voice prefix with the language of the text. English voices work best with English text, Japanese voices with Japanese text, and so on.

The speed control is useful for narration. Slightly slower speech often sounds clearer for long paragraphs.

## Performance notes

On the free T4 GPU, short sentences generate almost instantly. Longer paragraphs take a few seconds. The first request after loading the model may feel slower, but subsequent generations are faster.

Colab sessions can disconnect after inactivity, so download important audio files before closing the notebook.

## Conclusion

Self-hosting a text-to-speech system on Google Colab is a practical way to explore high-quality voice synthesis without dealing with usage limits or infrastructure setup. Kokoro provides a good balance between model size and audio quality, Gradio keeps the interface simple, and [Pinggy](https://pinggy.io/) bridges the gap between a private notebook and public access.

This setup works well for learning, prototyping, accessibility tools, or content creation workflows where flexibility matters more than polished commercial platforms.

### Reference

1.  [Self-Hosting Text-to-Speech AI for Free on Google Colab](https://pinggy.io/blog/self_hosting_text_to_speech_ai_on_google_colab/)
2.  [GitHub link](https://github.com/Bidisha314/TTS_application)