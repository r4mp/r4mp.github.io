// @ts-nocheck
var clicked = false;
var p1 = new Object();
var p2 = new Object();

function getPosition(event) {
  var p = new Object();
  p.x = event.offsetX;
  p.y = event.offsetY;

  return p;
}

function setDistance(event) {
  if (clicked === false) {
    p1 = getPosition(event);
    clicked = true;
  } else {
    p2 = getPosition(event);
    d = distance(p1, p2);

    createGrid(d);

    clicked = false;
  }
}

function createGrid(d) {
  var grid = document.querySelector("#grid");
  grid.style["background-size"] = d + "px " + d + "px";

  document.getElementById("distance").innerHTML = d;
}

function showPosition(event) {
  p = getPosition(event);
  var out = p.x + ", " + p.y;
  document.getElementById("position").innerHTML = out;
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function toggleGrid(event) {
  // option 1
  var gridVisibility = getComputedStyle(
    document.getElementById("grid")
  ).getPropertyValue("visibility");
  if (gridVisibility === "hidden") {
    document.getElementById("grid").style.setProperty("visibility", "visible");
  } else {
    document.getElementById("grid").style.setProperty("visibility", "hidden");
  }

  // option 2
  /*var gridOpacity = getComputedStyle(document.getElementById('grid')).getPropertyValue('opacity');
            if (gridOpacity === "0.5") {
                document.getElementById('grid').style.setProperty('opacity', '0');
            } else {
                document.getElementById('grid').style.setProperty('opacity', '0.5');
            }*/
}

function takeASnap() {
  const videoElement = document.querySelector("video#localVideo");
  const canvas = document.createElement("canvas"); // create a canvas
  const ctx = canvas.getContext("2d"); // get its context
  canvas.width = videoElement.videoWidth; // set its size to the one of the video
  canvas.height = videoElement.videoHeight;
  ctx.drawImage(videoElement, 0, 0); // the video
  return new Promise((res, rej) => {
    canvas.toBlob(res); // request a Blob from the canvas
  });
}

function downloadPicture(blob) {
  // uses the <a download> to download a Blob
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "screenshot-" + Date.now() + ".png";
  document.body.appendChild(a);
  a.click();
}

function startRecording() {
  // switch button's behavior
  const btn = this;
  btn.textContent = "stop recording";
  btn.onclick = stopRecording;

  const chunks = []; // here we will save all video data
  const videoElement = document.querySelector("video#localVideo");
  const rec = new MediaRecorder(videoElement.srcObject);
  // this event contains our data
  rec.ondataavailable = (e) => chunks.push(e.data);
  // when done, concatenate our chunks in a single Blob
  rec.onstop = (e) => downloadVideo(new Blob(chunks));
  rec.start();

  function stopRecording() {
    rec.stop();
    // switch button's behavior
    btn.textContent = "start recording";
    btn.onclick = startRecording;
  }
}

function downloadVideo(blob) {
  // uses the <a download> to download a Blob
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "recorded-" + Date.now() + ".webm";
  document.body.appendChild(a);
  a.click();
}

function setChoosableResolutions() {
  const resolutions = [
    {
      label: "4K(UHD)",
      width: 3840,
      height: 2160,
      ratio: "16:9",
    },
    {
      label: "8MP",
      width: 3264,
      height: 2448,
      ratio: "4:3",
    },
    {
      label: "5MP",
      width: 2592,
      height: 1944,
      ratio: "TODO",
    },
    {
      label: "1080p(FHD)",
      width: 1920,
      height: 1080,
      ratio: "16:9",
    },
    {
      label: "UXGA",
      width: 1600,
      height: 1200,
      ratio: "4:3",
    },
    {
      label: "720p(HD)",
      width: 1280,
      height: 720,
      ratio: "16:9",
    },
    {
      label: "SVGA",
      width: 800,
      height: 600,
      ratio: "4:3",
      default: true,
    },
    {
      label: "VGA",
      width: 640,
      height: 480,
      ratio: "4:3",
    },
    {
      label: "360p(nHD)",
      width: 640,
      height: 360,
      ratio: "16:9",
    },
    {
      label: "CIF",
      width: 352,
      height: 288,
      ratio: "4:3",
    },
    {
      label: "QVGA",
      width: 320,
      height: 240,
      ratio: "4:3",
    },
    {
      label: "QCIF",
      width: 176,
      height: 144,
      ratio: "4:3",
    },
    {
      label: "QQVGA",
      width: 160,
      height: 120,
      ratio: "4:3",
    },
  ];
  const outputResolutions = document.getElementById("outputResolutions");
  const cameraResolutions = document.getElementById("cameraResolutions");

  resolutions.forEach((element) => {
    if (element.default === true) {
      // TODO: Find a better solution
      outputResolutions.add(
        new Option(
          element.label + " - " + element.width + "x" + element.height,
          element.width + "x" + element.height,
          true,
          true
        )
      );
      cameraResolutions.add(
        new Option(
          element.label + " - " + element.width + "x" + element.height,
          element.width + "x" + element.height,
          true,
          true
        )
      );
    } else {
      outputResolutions.add(
        new Option(
          element.label + " - " + element.width + "x" + element.height,
          element.width + "x" + element.height
        )
      );
      cameraResolutions.add(
        new Option(
          element.label + " - " + element.width + "x" + element.height,
          element.width + "x" + element.height
        )
      );
    }
  });
}

function savePreviousCameraResolution() {
  const currentCamera = document.getElementById("availableCameras").value;
  const cameraResolution = document.getElementById("cameraResolutions").value;
  localStorage.setItem(
    "previousCameraResolution-" + currentCamera,
    cameraResolution
  );
}

async function chooseCameraResolution() {
  const currentCamera = document.getElementById("availableCameras").value;
  const cameraResolution = document
    .getElementById("cameraResolutions")
    .value.split("x");
  await playVideoFromCamera(currentCamera, cameraResolution[0]);
}

function chooseOutputResolution(event) {
  const outputResolution = document
    .getElementById("outputResolutions")
    .value.split("x");
  const ebene = document.getElementById("ebene");

  ebene.style.setProperty("width", outputResolution[0] + "px");
  ebene.style.setProperty("height", outputResolution[1] + "px");
}

function chooseCamera() {
  chooseCameraResolution();
  chooseOutputResolution();
}

// Fetch an array of devices of a certain type
async function getConnectedDevices(type) {
  await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === type);
}

function removeAll(selectBox) {
  while (selectBox.options.length > 0) {
    selectBox.remove(0);
  }
}

// Updates the select element with the provided set of cameras
async function updateCameraList(cameras) {
  const availableCameras = document.getElementById("availableCameras");
  removeAll(availableCameras);
  if (cameras && cameras.length > 0) {
    cameras.forEach((camera) => {
      const cameraOption = new Option(camera.label, camera.deviceId);
      availableCameras.add(cameraOption);
    });
    chooseCamera();
  }
}

// Open camera with at least minWidth and minHeight capabilities
async function openCamera(cameraId, minWidth) {
  const constraints = {
    audio: false,
    video: {
      deviceId: cameraId,
      width: {
        min: minWidth,
      },
    },
  };

  return await navigator.mediaDevices.getUserMedia(constraints);
}

async function playVideoFromCamera(cameraId, minWidth = 800) {
  try {
    const stream = await openCamera(cameraId, minWidth);
    const videoElement = document.querySelector("video#localVideo");
    videoElement.srcObject = stream;
    var playPromise = videoElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then((_) => {
          savePreviousCameraResolution();
        })
        .then(() => {
          // enable the button
          const btn = document.querySelector("#btnSnapshot");
          btn.disabled = false;
          btn.onclick = (e) => {
            takeASnap().then(downloadPicture);
          };
        })
        .then(() => {
          // enable the button
          const btn = document.querySelector("#btnVideo");
          btn.disabled = false;
          btn.onclick = startRecording;
        })
        .catch((error) => {
          console.error("Automatic playback failed.", error);
        });
    }
  } catch (error) {
    const cameraResolution = document.getElementById("cameraResolutions");
    const currentCamera = document.getElementById("availableCameras").value;
    const previousCameraResolution = localStorage.getItem(
      "previousCameraResolution-" + currentCamera
    );
    cameraResolution.value = previousCameraResolution;
    console.error("Error opening video camera.", error);
    alert(error);
  } finally {
    let currentCamInformation = getCurrentCamInformation();
    document.getElementById("availableCameras").value =
      currentCamInformation.deviceId;
  }
}

function getCurrentCamInformation() {
  const videoElement = document.querySelector("video#localVideo");
  let cameraInformation = document.getElementById("cameraInformation");
  let videoTracks = new MediaStream(videoElement.srcObject).getVideoTracks();

  let settings = videoTracks[0].getSettings();
  cameraInformation.innerText = JSON.stringify(settings, null, 2);
  return settings;
}

function getSupportedConstraints() {
  let constraintList = document.getElementById("constraintList");
  let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

  for (let constraint in supportedConstraints) {
    if (supportedConstraints.hasOwnProperty(constraint)) {
      let elem = document.createElement("li");

      elem.innerHTML = "<code>" + constraint + "</code>";
      constraintList.appendChild(elem);
    }
  }
}

document.onreadystatechange = async function () {
  if (document.readyState == "complete") {
    if (!navigator.mediaDevices.getUserMedia) {
      const err = "getUserMedia not supported in this browser.";
      console.error(err);
      return alert(err);
    }

    document.getElementById("grid").onmousemove = showPosition;
    document.getElementById("grid").onclick = setDistance;
    document.getElementById("btnToggleGrid").onclick = toggleGrid;
    document.getElementById("cameraResolutions").onchange =
      chooseCameraResolution;
    document.getElementById("cameraResolutions").onfocus =
      savePreviousCameraResolution;
    document.getElementById("outputResolutions").onchange =
      chooseOutputResolution;
    document.getElementById("availableCameras").onchange = chooseCamera;

    getSupportedConstraints();
    setChoosableResolutions();

    // Get the initial set of cameras connected
    const videoCameras = await getConnectedDevices("videoinput");
    if (videoCameras && videoCameras.length > 0) {
      await updateCameraList(videoCameras);
      const cameraId = document.getElementById("availableCameras").value;
      await playVideoFromCamera(cameraId);
    }

    // Listen for changes to media devices and update the list accordingly
    navigator.mediaDevices.addEventListener("devicechange", async (event) => {
      const newCameraList = await getConnectedDevices("videoinput");
      await updateCameraList(newCameraList);
    });
  }
};
