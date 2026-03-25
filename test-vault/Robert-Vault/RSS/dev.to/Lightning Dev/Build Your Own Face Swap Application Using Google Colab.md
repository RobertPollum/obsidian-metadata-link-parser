---
title: Build Your Own Face Swap Application Using Google Colab
link: https://dev.to/lightningdev123/build-your-own-face-swap-application-using-google-colab-4379
author: Lightning Developer
publish_date: 2026-01-19 00:37:54
saved_date: 2026-01-19 07:02:59
tags: #pinggy #webdev #ai #tutorial
---


Face swap applications are a practical way to understand computer vision pipelines, ONNX models, and lightweight web UI deployment. In this guide, you will build a complete Face Swap application using **Google Colab running on CPU**, without requiring a local machine or GPU.

The entire setup runs inside a single Colab notebook, which I named **FaceSwap.ipynb**. We will also expose the UI publicly so it can be accessed from any browser.

This approach is ideal for demos, learning, and rapid prototyping.

## Why CPU Only in Google Colab?

This setup works entirely on **CPU**. You do not need to enable GPU or TPU in Colab.

The InsightFace model used here is optimized enough to run on CPU for images. While GPU improves speed, CPU performance is sufficient for testing, demos, and small workloads.

To keep things simple:

-   Leave Colab runtime as **CPU**
-   No CUDA or GPU drivers are required
-   ONNX Runtime automatically falls back to CPU execution

## Prerequisites

Before starting, make sure you have:

-   A Google account
-   Access to Google Colab
-   Basic knowledge of running shell commands
-   A few sample images for testing face swap

## Step 1: Create a New Colab Notebook

1.  Open Google Colab
2.  Create a new notebook
3.  Rename it to **FaceSwap.ipynb**
4.  Make sure the runtime type is set to **CPU**

You can verify this from:  
Runtime → Change runtime type → Hardware accelerator → None

## Step 2: Clone the Face Swap UI Repository

Inside the first Colab cell, navigate to the working directory and clone the Face Swap UI repository.  

```
%cd /content
!rm -rf face-swap-ui
!git clone https://github.com/TheMasterFX/face-swap-ui.git
```

This step downloads:

-   The web UI
-   Backend logic
-   Face processing scripts

After cloning, the project files will be available under `/content`.

## Step 3: Download the Face Swap Model Manually

InsightFace expects the model to be stored in a specific directory structure.

Run the provided commands in a new Colab cell. These commands:  

```
!mkdir -p /root/.insightface/models

!wget -O /root/.insightface/models/inswapper_128.onnx \
https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx

```

1.  Create the InsightFace model directory
2.  Download `inswapper_128.onnx`
3.  Store it locally so the application can load it directly

This is important because automatic model downloads often fail or repeat unnecessarily in Colab.

## Step 4: Install Required Dependencies

Next, install all required Python packages.

Run the dependency installation commands provided in the repository.  

```
%cd /content/face-swap-ui
!pip install --upgrade pip
!pip install -r requirements.txt
```

These typically install:

-   InsightFace
-   ONNX Runtime for CPU
-   UI related libraries
-   Image processing dependencies

This step may take a short time. Once completed, the environment is fully prepared to run on the CPU.

## Step 5: Apply Required Patch Fixes

To make the UI work reliably in a Colab environment, a few specific fixes are required.

### Fix 1: Force Local Model Loading

```
!sed -i "s|get_model('inswapper_128.onnx'.*|get_model('/root/.insightface/models/inswapper_128.onnx', download=False)|" face_swap_ui.py
```

Update `faceSwapUi.py` so the application loads `inswapper_128.onnx` from the local path instead of attempting an online download.

### Fix 2: Resolve Case Sensitivity Issues

```
!sed -i "s/Label=/label=/g" face_swap_ui.py
```

Linux environments are case sensitive. Run the provided fix command to ensure file and module names match exactly. This prevents runtime import errors.

### Fix 3: Fix UI Layout Issues

```
!sed -i "s/\.style(height=400)//g" face_swap_ui.py
```

Edit the UI file to remove `.style(height=400)`.

This prevents rendering and layout problems when accessing the UI through a public browser session.

These patches ensure smooth execution in CPU-based Colab sessions.

## Step 6: Install and Configure Pinggy Tunnel

Colab notebooks run in a private environment. To access the UI externally, we need a tunneling solution.

1.  Run the command to install [Pinggy](https://pinggy.io/)

```
!pip install pinggy
```

1.  Execute the [Pinggy](https://pinggy.io/) tunnel command

```
import pinggy

tunnel = pinggy.start_tunnel(forwardto="localhost:7860")
print("Public URLs:", tunnel.urls)

```

Once started, [Pinggy](https://pinggy.io/) generates a **public URL** that forwards traffic to your local UI running inside Colab.

This URL can be accessed from:

-   Incognito mode
-   Another browser
-   Another device

## Step 7: Start the Face Swap Application

Now launch the Face Swap UI.

Run the final command to start the server.  

```
!python face_swap_ui.py
```

Since this is CPU-based, initial loading may take a little time. Wait until the server finishes initializing.

Once running:

-   Copy the generated [Pinggy](https://pinggy.io/) public URL
-   Keep the Colab cell running

## Step 8: Test the Application in Browser

1.  Open an incognito browser window
2.  Paste the public URL
3.  Click **Enter Site**

### Using the UI

-   Click **Drop image here** and upload the target image
-   Upload the image containing the face you want to swap
-   Click **Analyse** to detect faces
-   The UI will display the number of detected faces
-   Click **Swap** to perform the face swap

After processing, the swapped image will be displayed directly in the UI.

## Performance Notes

Since this setup runs on **CPU only**:

-   Image-based face swaps work smoothly
-   Processing may take a few seconds per swap
-   Video face swapping is slower and not recommended for long videos

For learning, testing, and sharing demos, CPU performance is more than sufficient.

## Conclusion

Building a Face Swap application on Google Colab using CPU is a practical and accessible way to experiment with AI-powered image processing. You avoid local setup issues while still getting a fully functional web UI.

With a public tunnel, this setup becomes ideal for:

-   Demos
-   Proof of concepts
-   Learning computer vision workflows
-   Sharing experiments with others

You can extend this further by adding video support, batch processing, or custom UI features.

## References:

1.  [Pinggy's Official Website](https://pinggy.io/)
2.  [GitHub:face-swap-ui](https://github.com/TheMasterFX/face-swap-ui)
3.  [Google Colab](https://colab.research.google.com/)
4.  [Colab Notebook link](https://github.com/Bidisha314/Face_Swap/blob/main/faceswap.ipynb)