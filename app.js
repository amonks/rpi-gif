// rpi-gif

var RaspiCam = require('raspicam')
var express = require('express')

var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

var latest = 0

var next_video = function () {
  return latest + 1
}

io.on('connection', function (socket) {
  // socket.emit('news', { hello: 'world' })
  // socket.on('my other event', function (data) {
  //   console.log(data)
  // })

  var i = next_video()
  var camera = new RaspiCam(video_opts({name: i}))
  setInterval(camera.start, process.env.FREQUENCY || 1000)

  camera.on('started', function (err, timestamp) {
    if (err) {
      console.log(err)
    } else {
      console.log('video started at ' + timestamp)
    }
  })

  camera.on('exit', function (timestamp) {
    // we can now do stuff with the captured image, which is stored in /data
    console.log('video child process has exited at ' + timestamp)
    socket.emit('captured', { url: '/videos/' + i + '.h264' })
  })
})

app.use('/videos', express.static('/data'))

app.get('/latest', function (req, res) {
  res.redirect('/videos/latest.h264')
})

app.get('/list', function (req, res) {
  res.send('hello')
})

var video_opts = function (opts) {
  var flips = {}
  if (process.env.HF === 'TRUE') {
    flips.hf = true
  }
  if (process.env.VF === 'TRUE') {
    flips.vf = true
  }
  var defaults = {
    mode: 'video',
    output: '/data/' + opts.name + '.h264',
    width: process.env.VIDEO_WIDTH || 960,
    height: process.env.VIDEO_HEIGHT || 540,
    framerate: process.env.VIDEO_FRAMERATE || 15,
    timeout: process.env.VIDEO_LENGTH || 3000
  }
  Object.assign(opts, flips)
  Object.assign(opts, defaults)
  return opts
}

server.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('rpi-gif listening at http://%s:%s', host, port)
  console.log('visit /capture or /latest')
})

