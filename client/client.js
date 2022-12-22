const MOVE_GUIDE = {
  OK: 0,
  MOVE_LEFT: 1,
  MOVE_RIGHT: 2,
  MOVE_CAMERA_DOWN: 3,
  MOVE_AWAY: 4,
}


const blobToData = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    //reader.onloadend = () => resolve(reader.result)
    reader.onloadend = function (e) {
      let base64data = reader.result
      resolve(base64data.split(',')[1]);
    }
    reader.readAsDataURL(blob)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas')
  const video = document.getElementById('video')
  const start_button = document.getElementById('start-button')
  const stop_button = document.getElementById('stop-button')
  const move_guide = document.getElementById('move-guide')
  let width = 640
  let height = 0

  let isStreaming = false
  let pose_interval
  let promise_array = []

  const websocketClient = new WebSocket('ws://localhost:12345/')

  const predictPose = async (blob) => {
    let bdata = await blobToData(blob)
    let message = { 'command': 'detect_pose', 'frame': bdata }
    websocketClient.send(JSON.stringify(message))
  }

  const handlePicturePromise = (promise) => {
    promise.then(blob => {
      predictPose(blob)
      promise_array.shift()
      if (promise_array[0]) handlePicturePromise(promise_array[0])
    })
  }

  const takePicture = () => {
    let result = new Promise((resolve) => {
      canvas.getContext('2d').drawImage(video, 0, 0, width, height)
      canvas.toBlob(blob => { resolve(blob) }, 'image/jpeg')
    })
    if (promise_array.length >= 3) {
      if (promise_array[0]) promise_array = [promise_array[0]]
    }
    promise_array.push(result)
    if (promise_array.length == 1) handlePicturePromise(result)
  }

  const getWebcam = () => {
    let isSafari = navigator.userAgent.indexOf('Safari')
    if (isSafari) {
      video.muted = true
      video.playsInline = true
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          video.srcObject = stream
          video.play()
        })
        .catch(err => { console.log(err) })
    }
    else {
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      let constraint = {
        audio: false,
        video: {
          facingMode: 'user'
        }
      }
      navigator.mediaDevices.getUserMedia(constraint)
        .then(stream => {
          video.srcObject = stream
        })
        .catch(err => { console.log(err) })
    }

    video.addEventListener('canplay', () => {
      if (!isStreaming) {
        isStreaming = true
        height = video.videoHeight / (video.videoWidth / width)
        video.setAttribute('width', width.toString());
        video.setAttribute('height', height.toString());
        canvas.setAttribute('width', width.toString());
        canvas.setAttribute('height', height.toString());
      }
    }, false)
  }

  const startTakePicture = () => {
    let time = 1000
    pose_interval = setInterval(() => { takePicture() }, time)
  }

  const stopTakePicture = () => {
    clearInterval(pose_interval)
  }

  websocketClient.onopen = () => {
    console.log('Client connected!')
  }

  websocketClient.onmessage = (message) => {
    const data = JSON.parse(message.data)
    move_guide.innerText = `Move Guide ${data.mguide}`
  }

  getWebcam()

  start_button.onclick = () => {
    stopTakePicture()
    startTakePicture()
  }

  stop_button.onclick = () => {
    stopTakePicture()
  }
}, false)

