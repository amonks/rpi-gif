function video_opts (opts) {
  var flips = {}
  if (false === 'TRUE') {
    flips.hf = true
  }
  if (false === 'TRUE') {
    flips.vf = true
  }
  var defaults = {
    mode: 'video',
    output: '/data/' + opts.name + '.264',
    width: 960,
    height: 540,
    framerate: 15,
    timeout: 3000
  }
  Object.assign(opts, flips)
  Object.assign(opts, defaults)
  return opts
}
