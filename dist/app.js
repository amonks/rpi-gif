'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// rpi-gif

var RaspiCam = require('raspicam');

var aws = require('aws-sdk');
var express = require('express');
var app = express();
var Twitter = require('node-twitter');
var http = require('http');
var fs = require('fs');

app.use('/f', express.static('../../../data'));

var twitterRestClient = new Twitter.RestClient(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET, process.env.TOKEN_KEY, process.env.TOKEN_SECRET);

var exec = require('child_process').exec;

function video_opts() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var flips = {};
  if (process.env.HF === 'TRUE') {
    flips.hf = true;
  }
  if (process.env.VF === 'TRUE') {
    flips.vf = true;
  }
  var defaults = {
    mode: 'video',
    output: '../../../data/' + 'vid' + '.264',
    width: process.env.VIDEO_WIDTH || 480,
    height: process.env.VIDEO_HEIGHT || 270,
    framerate: process.env.VIDEO_FRAMERATE || 5,
    timeout: process.env.VIDEO_LENGTH || 5000
  };
  _extends(opts, flips);
  _extends(opts, defaults);
  return opts;
}

var camera = new RaspiCam(video_opts());

camera.on('started', function (err, timestamp) {
  if (err) {
    console.log('error starting camera: ' + err);
  } else {
    console.log('video started at ' + timestamp);
  }
});

camera.on('exit', function (timestamp) {
  // we can now do stuff with the captured image, which is stored in /data
  console.log('video child process has exited at ' + timestamp);
  console.log('now gonna start video conversion process');

  var command = 'avconv -y     -r ' + (process.env.CAMERA_RATE || 10) + '     -i /data/vid.264 -vcodec copy /data/vid.mp4 &&     avconv -y -i /data/vid.mp4 -vf     scale=' + (process.env.VIDEO_WIDTH || 480) + ':' + (process.env.VIDEO_HEIGHT || 270) + ',format=rgb8,format=rgb24     -r ' + (process.env.VIDEO_RATE || 10) + ' /data/vid.gif';
  console.log(command);
  exec(command, function (error, stdout, stderr) {
    if (error) {
      console.log('conversion process failed with error: ' + error);
    }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    console.log('conversion child process has exited. Now gonna upload to twitter');
    upload_to_twitter('/data/vid.gif', 'THIS TIME ITS REAL');
  });
});

var upload_to_twitter = function upload_to_twitter(file, status) {
  console.log('just called upload_to_twitter. file: ' + file + ' status: ' + status);
  twitterRestClient.statusesUpdateWithMedia({
    'media[]': '' + file,
    status: status
  }, function (error, tweet) {
    if (error) {
      console.log('error uploading to twitter. code: ' + error.code + ' message: ' + error.message);
    } else {
      console.log('successfully uploaded to twitter: ' + tweet.id);
      var s3bucket = new aws.S3({
        params: {
          Bucket: process.env.AWS_S3_BUCKET
        }
      });
      fs.readFile(file, function (err, fileContents) {
        if (err) {
          console.log('error reading file', file, err);
        } else {
          console.log('BUCKET', process.env.AWS_S3_BUCKET);
          var params = {
            'Bucket': process.env.AWS_S3_BUCKET,
            'Key': tweet.id_str + '.gif',
            'Body': fileContents,
            'ContentType': 'image/gif',
            'ACL': 'public-read'
          };
          s3bucket.upload(params, function (err, data) {
            if (err) {
              console.log('Error uploading data:', err);
            } else {
              console.log('Successfully uploaded data to myBucket/myKey');
              var req_url = process.env.PROXY_URL + '/incoming/' + tweet.id;
              if (process.env.FLUSH === 'TRUE') {
                req_url = process.env.PROXY_URL + '/flush';
              }
              console.log('gonna make a request to: ' + req_url);
              var req = http.get(req_url);
              req.on('error', function (e) {
                console.log('problem with request: ' + e.message);
              });
            }
          });
        }
      });
    }
  });
};

console.log('about to start camera interval');
if (process.env.RECORD && process.env.RECORD !== 'FALSE') {
  camera.start();
  setInterval(function () {
    camera.start();
  }, process.env.VIDEO_PERIOD || 10000);
}

app.listen(3000, function () {
  console.log('listening on 3000');
});