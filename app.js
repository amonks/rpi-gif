
var RaspiCam = require("raspicam")
var app = require("express")()

app.get('/capture', function (req, res) {
  res.send('capturing')
  camera.start()
  console.log('capturing')
}

var camera = new RaspiCam({
  mode: "video",
  output: "../data/video.h264",
  framerate: process.env.VIDEO_FRAMERATE || 15
  timeout: process.env.VIDEO_LENGTH || 3000
})

camera.on("started", function( err, timestamp ){
  console.log("video started at " + timestamp )
})


camera.on("read", function( err, timestamp, filename ){
  console.log("video captured with filename: " + filename )
  // we can now do stuff with the captured image, which is stored in /data
})

camera.on("exit", function( timestamp ){
  console.log("video child process has exited at " + timestamp )
})


