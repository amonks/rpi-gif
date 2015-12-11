'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// rpi-gif

var RaspiCam = require('raspicam');

var aws = require('aws-sdk');
var Twitter = require('node-twitter');
var http = require('http');
var fs = require('fs');

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
    output: '/data/' + 'vid' + '.264',
    width: process.env.VIDEO_WIDTH || 960,
    height: process.env.VIDEO_HEIGHT || 540,
    framerate: process.env.VIDEO_FRAMERATE || 15,
    timeout: process.env.VIDEO_LENGTH || 3000
  };
  _extends(opts, flips);
  _extends(opts, defaults);
  return opts;
}

console.log('about to construct camera. video_opts: ' + video_opts());
var camera = new RaspiCam(video_opts());
setInterval(camera.start, process.env.FREQUENCY || 10000);

camera.on('started', function (err, timestamp) {
  if (err) {
    console.log(err);
  } else {
    console.log('video started at ' + timestamp);
  }
});

camera.on('exit', function (timestamp) {
  // we can now do stuff with the captured image, which is stored in /data
  console.log('video child process has exited at ' + timestamp);

  exec('avconf -i /data/vid.264 -vcodef copy /data/vid.mp4', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    upload_to_twitter('/data/vid.mp4', 'cool, huh?');
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
});

var upload_to_twitter = function upload_to_twitter(file, status) {
  twitterRestClient.statusesUpdateWithMedia({
    'media[]': '' + file,
    status: status
  }, function (error, tweet) {
    if (error) {
      console.log(error);
    } else {
      console.log(tweet.id);
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
              http.get(process.env.PROXY_URL + '/incoming/' + tweet.id);
            }
          });
        }
      });
    }
  });
};