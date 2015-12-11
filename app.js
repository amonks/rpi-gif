// rpi-gif

var RaspiCam = require('raspicam')
var express = require('express')
var app = express()

app.use('/videos', express.static('/data'))

app.get('/capture', function (req, res) {
  camera.start()
  console.log('capturing')
  res.send('capturing')
})

app.get('/latest', function (req, res) {
  res.redirect('/videos/latest.h264')
})

var camera = new RaspiCam({
  mode: 'video',
  output: '/data/latest.h264',
  framerate: process.env.VIDEO_FRAMERATE || 15,
  timeout: process.env.VIDEO_LENGTH || 3000
})

camera.on('started', function (err, timestamp) {
  if (err) {
    console.log(err)
  } else {
    console.log('video started at ' + timestamp)
  }
})

camera.on('read', function (err, timestamp, filename) {
  if (err) {
    console.log(err)
  } else {
    console.log('video capturing with filename: ' + filename)
  }
})

camera.on('exit', function (timestamp) {
  console.log('video child process has exited at ' + timestamp)
  // we can now do stuff with the captured image, which is stored in /data
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('rpi-gif listening at http://%s:%s', host, port)
  console.log('visit /capture or /latest')
})
