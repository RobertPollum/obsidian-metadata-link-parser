---
title: "Goodbye AndroidView: A Real CameraX QR Scanner in Compose"
link: https://levelup.gitconnected.com/goodbye-androidview-a-real-camerax-qr-scanner-in-compose-9a658e1ad70c?source=rss----5517fd7b58a6---4
author: James Cullimore
publish_date: 2026-01-14 17:49:58
saved_date: 2026-01-17 15:09:58
image: https://cdn-images-1.medium.com/max/1024/1*dQ0hL8953SnmuvLeQOZb1A.png
tags: #android-development #jetpack-compose #kotlin #android
---

![image](https://cdn-images-1.medium.com/max/1024/1*dQ0hL8953SnmuvLeQOZb1A.png)

![](https://cdn-images-1.medium.com/max/1024/1*dQ0hL8953SnmuvLeQOZb1A.png)

In a recent project, we needed to add a QR scanner that allows users to quickly connect to a Wi-Fi network. This is not a new problem. I have implemented Wi-Fi QR scanning multiple times over the years, and on paper, it should be straightforward. Scan a code, extract the SSID and password, and initiate a connection.

In practice, it was always slightly frustrating. Even with Jetpack Compose, camera based features almost inevitably pulled me back into AndroidView. That felt like a step backwards, especially in an otherwise fully Compose driven screen. Every time I revisited this problem, I found myself asking the same question. Is this really still the best we can do.

Recently, that answer finally changed.

With the introduction of CameraX Compose artifacts and CameraXViewfinder, it is now possible to build a fully Compose native camera experience without falling back to view interop. The problem was not capability, but documentation. While the APIs exist, finding a clear, real world example that goes beyond a demo proved difficult.

After coming across a small but extremely helpful [gist by Jolanda Verhoef](https://gist.github.com/JolandaVerhoef/74d4696b804736c698450bd34b5c9ff8), I was able to piece together the missing parts and adapt them into a production ready QR scanner. I later extracted and refined this work into one of my open source projects so the implementation can evolve over time.

This article walks through that journey. We will build a QR scanner screen using modern CameraX Compose APIs, analyze Wi-Fi QR codes using ML Kit, and connect to a network without touching AndroidView at all. If you have avoided camera features in Compose because they felt awkward or incomplete, this is the missing piece.

### Why QR scanning for Wi-Fi used to be annoying in Compose

For a long time, building camera based features in Jetpack Compose came with an implicit compromise. Even if the rest of your UI was fully declarative, the camera preview itself almost always lived inside an AndroidView. CameraX was mature and reliable, but its integration story with Compose lagged behind.

That created a few recurring problems.

First, the mental model broke down. Compose encourages state driven UI and lifecycle awareness at the composable level, but AndroidView brings imperative setup, callbacks, and view lifecycle concerns back into the picture. You could make it work, but the code often felt stitched together rather than designed as a whole.

Second, gesture handling became awkward. Things like tap to focus, overlays, or animations layered on top of the preview required careful coordination between Compose and the underlying PreviewView. Debugging touch offsets and coordinate conversions was common and rarely enjoyable.

Finally, these implementations aged poorly. Each time CameraX or Compose evolved, the glue code had to be revisited. What started as a small interop block often turned into one of the most fragile parts of the screen.

For QR scanning specifically, this friction felt unnecessary. The use case is simple. Show a camera preview, analyze frames, react to a result. Yet the implementation complexity was disproportionate to the problem being solved.

This is why the introduction of CameraX Compose support is such a big deal. It removes the need for view interop entirely and allows camera previews to behave like any other composable. Layout, gestures, lifecycle, and state all live in the same mental model again.

In the next section, we will look at what changed, and which CameraX Compose APIs finally made this possible.

### The shift away from AndroidView with CameraX Compose

The real turning point for camera based features in Compose came with the introduction of CameraX Compose artifacts and, more importantly, CameraXViewfinder. Instead of embedding a PreviewView inside AndroidView, we can now work directly with a SurfaceRequest and render it as a composable.

This is a subtle but important shift.

Rather than treating the camera preview as an opaque view, the preview becomes just another piece of UI. It participates naturally in Compose layout, can be clipped, layered, animated, and responds to pointer input without special handling. There is no view hierarchy boundary to work around.

At a high level, the flow now looks like this:

-   CameraX produces a SurfaceRequest
-   The composable collects and renders that request using CameraXViewfinder
-   Camera use cases are bound and unbound using normal lifecycle awareness
-   Gesture input and overlays live entirely in Compose

This approach also encourages better separation of concerns. Camera setup and binding can live in a ViewModel, while the composable remains focused on rendering state and handling user interaction. That split is especially valuable for QR scanning, where frame analysis and UI feedback evolve independently.

In the implementation we are about to walk through, the camera preview is driven by a small, focused CameraPreviewViewModel. It exposes a StateFlow<SurfaceRequest?>, which the UI simply collects and displays. No view interop, no imperative wiring in the composable itself.

With that foundation in place, we can start looking at the actual screen. Next, we will break down the overall architecture of the QR scanner screen and how responsibilities are divided across composables and view models.

### High level architecture of the QR scanner screen

Before diving into camera setup or QR analysis, it is worth stepping back and looking at how the screen is structured. This is not just a camera demo. It is a production screen that deals with permissions, lifecycle changes, UI state, error handling, and navigation.

At the top level, the screen is split into three main responsibilities:

1.  Navigation and screen entry points
2.  Wi-Fi related state and business logic
3.  Camera preview and QR analysis

This separation is reflected directly in the composables.

The first entry point is a thin wrapper that integrates with navigation:

This function does exactly one thing. It adapts navigation concerns into simple callbacks. By doing this, the rest of the screen remains unaware of NavHostController, which keeps the UI easier to preview, test, and reuse.

The second layer of the screen handles permissions, lifecycle awareness, and Wi-Fi connection state. This is where the WiFiViewModel is used, camera permissions are requested, and QR scan results are translated into connection attempts. This composable owns the logic, but not the camera rendering itself.

Finally, the lowest layer focuses purely on UI. It renders the scaffold, camera card, loading state, and delegates scanning results upward via a simple callback. This layer has no knowledge of Wi-Fi, permissions, or navigation.

That split is intentional.

By keeping camera rendering isolated from business logic, it becomes much easier to reason about each piece independently. Camera code tends to be sensitive to lifecycle changes and threading, while Wi-Fi logic evolves with platform APIs and user flows. Mixing them together would make both harder to maintain.

In the next section, we will take a closer look at how permissions and lifecycle events are handled, and why they matter so much for a camera driven screen.

### Permissions, lifecycle, and UI state handling

Camera screens live and die by lifecycle timing. If permissions are missing, you cannot even start. If the app goes to the background and comes back, you need to re-check state. And if your QR scan triggers a Wi-Fi connection attempt, the UI has to react immediately.

In your implementation, this responsibility sits in the middle layer composable. It is where you combine:

-   Camera permission handling (via Accompanist permissions)
-   Lifecycle observation (ON\_RESUME)
-   Wi-Fi connection state driven by WiFiViewModel
-   UI reactions (navigate back on success, show a dialog on failure)
-   Passing a clean onAnalyze callback down into the camera layer

Here is that layer, unchanged:

#### Why this works well

**Permission checks happen at the right time.**  
You request Manifest.permission.CAMERA, but you do it in response to ON\_RESUME. That matters because the user might bounce to Settings and back, or deny once and later accept. Checking only once at first composition often misses those flows.

**Lifecycle observation is explicit and scoped.**  
Using DisposableEffect(lifecycleOwner) keeps the observer tied to the current lifecycle owner, and guarantees cleanup in onDispose. That prevents the classic “observer keeps firing after navigation” bug.

**The UI reacts to connection state rather than guessing.**  
Instead of assuming a scan means success, you let uiState.connectionState drive outcomes:

-   CONNECTED navigates back
-   FAILED opens a dialog once
-   CONNECTING becomes a UI loading state in the next composable

**The QR result is translated into app language immediately.**  
Barcode.WiFi gives you raw fields. You normalize them:

-   ssid and password are stored locally
-   encryptionType is mapped into your own SecurityType
-   the connection attempt is triggered with suggestWiFi(...)

That keeps the camera layer clean. The camera does not need to know what “connect to Wi-Fi” means. It only reports what it saw.

### Camera preview with CameraXViewfinder

Now we get to the part that used to force AndroidView.

This layer is intentionally dumb. It does not know what Wi-Fi is. It does not manage permissions. It does not decide what to do with a scan result. It is just UI that shows a camera preview, handles taps, and reports Barcode.WiFi results upward.

You start by rendering a scaffold with a simple top bar back button, some instruction text, and a card that contains either a progress indicator or the actual camera content:

#### What this layer gets right

**The camera preview lives inside normal Compose layout.**  
It is just content inside an ElevatedCard. That means it behaves like any other composable. Rounded corners, padding, overlays, loading states, it all stays in one UI system.

**Connection state is visual, not implicit.**  
The connecting flag is driven by your WiFiUiState, and the UI is honest about what is happening. When a scan triggers a connection attempt, you show a progress indicator instead of continuing to scan.

**The camera logic is deferred to a dedicated component.**  
The preview itself is delegated to CameraPreviewContent(...), which is where CameraXViewfinder comes in. This keeps the screen structure readable and makes it easier to swap out preview behavior without touching the rest of the screen.

One important detail here is that you are using a CameraPreviewViewModel, but it is not the usual viewModel() call. You are creating it via:

val viewModel = remember { CameraPreviewViewModel() }

That works, and it is consistent with your intent: this is a tiny, screen-scoped holder for camera resources and state, not an app-wide model. It is created once per composition and retained as long as this part of the UI stays alive.

Next, we will look inside CameraPreviewContent and see how the SurfaceRequest is collected and rendered with CameraXViewfinder.

### Rendering the SurfaceRequest with CameraPreviewContent

This is where the modern Compose-first camera flow becomes real.

Instead of embedding a PreviewView, your UI collects a SurfaceRequest from a StateFlow and hands it to CameraXViewfinder. CameraX provides the surface, Compose renders it, and everything stays in the same input and layout system.

Here is the composable that does that work:

#### What is happening here

**The preview is driven by state**  
This line is the whole trick:

val surfaceRequest by viewModel.surfaceRequest.collectAsStateWithLifecycle()

The CameraPreviewViewModel publishes a SurfaceRequest when CameraX is ready to stream frames. The UI does not pull it. It just reacts when it appears.

**Camera binding is lifecycle-aware, but still Compose-native**  
You bind in a LaunchedEffect:

LaunchedEffect(lifecycleOwner, onAnalyze) {  
    viewModel.bindToCamera(context.applicationContext, lifecycleOwner, onAnalyze)  
}

That means:

-   binding runs when this composable becomes active
-   if the lifecycle owner changes (for example, navigation or configuration), the effect restarts cleanly
-   the binding call is a suspend function, which fits naturally here

**CameraXViewfinder renders the camera feed without view interop**  
Once a request exists:

This is the replacement for AndroidView(PreviewView).

**Tap to focus stays fully in Compose input**  
You attach pointerInput directly to the viewfinder and handle taps with detectTapGestures. The key is the coordinate conversion:

with(coordinateTransformer) {  
    currentOnTapToFocus(tapCoords.transform())  
}

This is one of those details that used to be painful with interop. Here it is explicit, controlled, and local to the UI that needs it.

**Autofocus indicator plumbing is already in place**  
You track tap coordinates via:

var autofocusRequest by remember { mutableStateOf(UUID.randomUUID() to Offset.Unspecified) }

and clear them after a delay. Even though this snippet does not yet draw an indicator, the state is there to support one. That is a nice pattern: keep the interaction state close to the input handling, even if the visuals come later.

Next, we will jump into the CameraPreviewViewModel and see how it creates the preview use case, publishes SurfaceRequest, binds to lifecycle, and wires up image analysis for QR detection.

### Binding CameraX use cases and publishing SurfaceRequest

The CameraPreviewViewModel is the engine room. It does two key jobs:

-   It creates a CameraX preview use case and exposes its SurfaceRequest as state for Compose.
-   It binds the camera to a lifecycle and sets up an ImageAnalysis pipeline that feeds QR scan results back to the UI.

Here is your implementation, unchanged:

#### Publishing a SurfaceRequest to Compose

This is the heart of the Compose integration:

Instead of giving CameraX a view to draw into, you expose the SurfaceRequest via a StateFlow. The UI collects it and passes it to CameraXViewfinder. That is the entire replacement for view interop.

At the same time, you capture the preview resolution and build a SurfaceOrientedMeteringPointFactory. This becomes important later for tap to focus, because metering points must be created in the coordinate space CameraX expects.

#### Binding preview + analysis together

Inside bindToCamera(...), you assemble two use cases:

-   cameraPreviewUseCase for the live preview
-   imageAnalysis for QR decoding

The analysis use case is configured to keep only the latest frame:

.setBackpressureStrategy(ImageAnalysis.STRATEGY\_KEEP\_ONLY\_LATEST)

That is exactly what you want for QR scanning. There is no benefit in decoding stale frames, and you do not want analysis lag to build up while the user moves the phone.

Then you attach an analyzer that hands results back through onAnalyze:

setAnalyzer(cameraExecutor, QrCodeAnalyzer { qrCode ->  
    qrCode.wifi?.let { wifi -> onAnalyze(wifi) }  
})

Notice the boundary here: the analyzer emits a QR code model, and you only forward the Wi-Fi payload if it exists. That keeps the UI contract clean: onAnalyze only receives Barcode.WiFi.

#### awaitCancellation() and guaranteed cleanup

This pattern is doing a lot of work for you:

Because bindToCamera is called from a LaunchedEffect, it will be cancelled when the composable leaves composition. awaitCancellation() suspends forever until that cancellation happens. When it does, you immediately unbind the camera and shut down the executor in finally.

That means you get predictable cleanup without needing a second callback or explicit “stop camera” API.

#### Tap to focus

The focus code is intentionally minimal:

val point = surfaceMeteringPointFactory?.createPoint(tapCoords.x, tapCoords.y)  
if (point != null) {  
    val meteringAction = FocusMeteringAction.Builder(point).build()  
    cameraControl?.startFocusAndMetering(meteringAction)  
}

You only need two ingredients:

-   a metering point factory created from the preview surface resolution
-   a CameraControl reference from the bound camera

Everything else stays in Compose input handling, which is exactly where it belongs.

Next, we will zoom in on the QR decoding itself: what QrCodeAnalyzer is expected to do, how ML Kit fits in, and what to watch out for when you translate raw barcodes into a Wi-Fi connection flow.

### QR analysis with ML Kit and QrCodeAnalyzer

Up to this point, everything has been about getting a Compose-native preview on screen and binding the right CameraX use cases. The QR scanning part happens in one very small seam in your ImageAnalysis setup:

setAnalyzer(cameraExecutor, QrCodeAnalyzer { qrCode ->  
    qrCode.wifi?.let { wifi -> onAnalyze(wifi) }  
})

That line tells us a lot about the design, even without looking at the QrCodeAnalyzer implementation.

#### The contract you built is clean

Your UI does not care about raw QR payloads, QR formats, or general barcode content. It only cares about one thing: does the scanned code contain a Wi-Fi payload?

ML Kit’s barcode API can return many barcode types and data shapes, but Wi-Fi QR codes are a first-class supported type via Barcode.WiFi. The analyzer is expected to do the heavy lifting, then surface a result where wifi is either present or absent.

That gives you a very tight interface:

-   camera frames go in
-   a QR model comes out
-   you forward only Barcode.WiFi into onAnalyze

#### Why STRATEGY\_KEEP\_ONLY\_LATEST is the right choice

You configured image analysis like this:

.setBackpressureStrategy(ImageAnalysis.STRATEGY\_KEEP\_ONLY\_LATEST)

For QR scanning, this is exactly what you want. If decoding takes a little longer on some devices, you do not want a queue of old frames. You want the newest frame available when the analyzer is ready again. Android’s CameraX docs explicitly call out STRATEGY\_KEEP\_ONLY\_LATEST as the non-blocking approach for analysis.

#### What QrCodeAnalyzer typically does

Your analyzer is expected to bridge CameraX ImageProxy frames into ML Kit’s BarcodeScanner pipeline:

-   Convert the ImageProxy to an ML Kit InputImage
-   Call barcodeScanner.process(image)
-   Filter results for Wi-Fi payloads
-   Close the ImageProxy reliably to avoid stalling analysis

ML Kit’s barcode scanning docs describe creating a scanner via BarcodeScanning.getClient(...), creating an InputImage, and processing it through the scanner.

#### Optional official snippet (ML Kit setup)

You did not include QrCodeAnalyzer in the provided code, so I will not invent one. But to ground what it likely contains, this is the core ML Kit setup pattern from the official documentation, shown here only as a reference point:

val scanner = BarcodeScanning.getClient()

ML Kit also recommends using getClient(BarcodeScannerOptions) when you can restrict formats for better performance.

#### A practical note for Wi-Fi QR codes

Your mapping logic earlier depends on ML Kit’s Wi-Fi encryption type constants:

-   Barcode.WiFi.TYPE\_OPEN
-   Barcode.WiFi.TYPE\_WEP
-   Barcode.WiFi.TYPE\_WPA

That is exactly the right place for this logic: in the screen layer that translates scan results into app behavior, not inside the camera layer.

### Tap to focus and coordinate transforming

Tap to focus is one of those features that sounds simple until you ship it. You are dealing with at least three coordinate spaces at once:

-   the tap location in Compose
-   the preview surface coordinates
-   the camera’s metering coordinate system

When AndroidView was involved, a lot of this turned into guesswork. Your implementation is clean because it makes the conversion explicit and keeps each step close to the code that owns it.

#### Capture taps on the viewfinder

You attach pointer input directly to CameraXViewfinder and listen for taps:

— -

The key detail here is that you do not pass raw tapCoords to the camera. You transform them first, using MutableCoordinateTransformer, which exists specifically to convert between Compose coordinates and the underlying surface coordinates used by the viewfinder.

#### Build a metering point factory from the surface resolution

In your CameraPreviewViewModel, you create the SurfaceOrientedMeteringPointFactory as soon as CameraX gives you a SurfaceRequest:

This factory is how you translate a tap location into a MeteringPoint the camera can use. Building it from the surface resolution is a common pattern for tap to focus with CameraX.

#### Trigger focus and metering using CameraControl

Once you have a metering point, you build a FocusMeteringAction and hand it to cameraControl.startFocusAndMetering(...):

CameraX documentation explicitly calls out startFocusAndMetering() with a FocusMeteringAction as the foundation for implementing tap to focus.

[https://developer.android.com/media/camera/camerax/configuration](https://developer.android.com/media/camera/camerax/configuration?utm_source=chatgpt.com)

#### Why this is a solid Compose-first approach

-   Compose owns the gesture and the UI state for it.
-   The viewfinder owns coordinate transformation.
-   The view model owns camera control and metering logic.

Nothing is doing “a bit of everything”, which is usually where camera code starts to rot.

One small caveat worth mentioning in the article: focus accuracy depends heavily on correct coordinate conversion and preview scaling. The Compose viewfinder plus transformer is designed to handle that conversion, and it is a big part of why this approach feels better than wiring it up manually.

[Tap to focus: Mastering CameraX Transformations in Jetpack Compose](https://medium.com/androiddevelopers/tap-to-focus-mastering-camerax-transformations-in-jetpack-compose-440853280a6e)

### Connecting state, UX, and production considerations

Once the camera preview and analysis pipeline are working, the next problems are not camera problems anymore. They are product problems.

QR scanning is fast, noisy, and repetitive. A camera feed will happily detect the same QR code frame after frame, and if you respond to every detection, you can easily spam your own connection flow.

Your code already hints at the right approach: treat scanning as a trigger, then move the UI into a controlled “connection attempt” state.

#### Stop scanning when you are connecting

In your UI layer you have a clean gate:

When uiState.connectionState == ConnectionState.CONNECTING, the camera preview is not even composed. That means the LaunchedEffect that binds the camera gets cancelled, and awaitCancellation() ensures the camera is unbound and the executor is shut down. This is exactly what you want in a production flow: once you have a valid Wi-Fi payload, the scanner becomes irrelevant until the connection succeeds or fails.

This is one of the biggest differences between a demo scanner and a real one. A demo keeps scanning forever. A real one transitions to the next user intent.

#### Handle the “Settings detour” correctly

Your lifecycle observer checks permission state and connection status on ON\_RESUME:

This matters because users often take a detour:

-   they deny camera permission
-   you send them to Settings
-   they come back
-   the screen needs to immediately re-check and continue the flow

Doing this work on resume is the right timing for those real-world loops.

#### Avoid repeated connection attempts from repeated scans

Right now, your analyzer forwards every Wi-Fi payload it sees:

qrCode.wifi?.let { wifi -> onAnalyze(wifi) }

That is fine because your UI layer effectively disables scanning once you transition to CONNECTING. But there is still a small edge case window: you can get multiple callbacks before the UI state flips.

A common production pattern is to add a simple throttle or “first valid scan wins” guard in the layer that handles onAnalyze. You do not have to change your camera pipeline to do this. The clean boundary you already have makes it easy to add later.

If you decide to mention this in the article, frame it as:

-   keep the analyzer simple and fast
-   control scan frequency where business logic lives

#### Keep analysis non-blocking and responsive

Your use of:

.setBackpressureStrategy(ImageAnalysis.STRATEGY\_KEEP\_ONLY\_LATEST)

is a production-friendly default. CameraX describes this as the non-blocking approach where the analyzer receives the most recent frame available, rather than building up a backlog.

For QR scanning, that is exactly the behavior users expect. If they move the camera, the scanner should react to what is currently in view, not what was in view half a second ago.

#### Make cleanup predictable

This is easy to overlook until you hit device-specific camera issues. Your cleanup is explicit and tied to cancellation:

This is a solid pattern for Compose-driven camera code. You do not leak executors, and you do not keep the camera bound after navigation.

#### Expect imperfect QR codes

Wi-Fi QR codes are generally well supported, and ML Kit’s Barcode.WiFi exposes ssid, password, and encryptionType directly.

In practice though, you will still see:

-   blank passwords for open networks
-   missing or unusual values from third-party QR generators
-   encryption types that do not map cleanly

Your logic already accounts for that:

password.ifBlank { null }

and

else -> SecurityType.UNKNOWN

Those are the kinds of small defensive moves that keep a scanner from becoming brittle.

### Conclusion

What I wanted from this feature was simple: scan a Wi-Fi QR code, extract the credentials, and help the user connect. The frustrating part was never ML Kit or even CameraX itself. It was the feeling that a modern Compose screen still had to fall back to AndroidView for something as common as a camera preview.

That has finally shifted.

By building the preview around SurfaceRequest and rendering it with CameraXViewfinder, the camera stops being a special case. It becomes composable UI. Gestures stay in Compose, state stays in Compose, and lifecycle cleanup becomes predictable because it is driven by cancellation instead of ad-hoc teardown code.

The result is a screen that is easier to maintain and easier to reason about. Your top-level composables handle navigation, permissions, and connection state. The camera layer does one job: show a preview and emit scan results. And the view model holds the plumbing needed to bind use cases, publish the surface request, and support tap to focus.

If you want to see this wired together in a real project, including how it evolves over time, the full implementation lives in an open source project of mine. The QR scanner screen shown throughout this article is taken directly from that codebase, and you can follow along or adapt it for your own use:

[WiFiWizard/app/src/main/java/dev/jamescullimore/wifiwizard/ui/QrScannerScreen.kt at main · LethalMaus/WiFiWizard](https://github.com/LethalMaus/WiFiWizard/blob/main/app/src/main/java/dev/jamescullimore/wifiwizard/ui/QrScannerScreen.kt)

If you have been avoiding camera features in Compose because they felt messy or incomplete, this is the first approach that feels like it belongs. No interop scaffolding, no mismatched lifecycles, no view hierarchy compromises. Just a camera preview that behaves like the rest of your UI.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=9a658e1ad70c)

* * *

[Goodbye AndroidView: A Real CameraX QR Scanner in Compose](https://levelup.gitconnected.com/goodbye-androidview-a-real-camerax-qr-scanner-in-compose-9a658e1ad70c) was originally published in [Level Up Coding](https://levelup.gitconnected.com) on Medium, where people are continuing the conversation by highlighting and responding to this story.