'use strict'

var Mash = function () {
  var n = 0xefc8249d
  var mash = function (data) {
    if (data) {
      data = data.toString()
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i)
        var h = 0.02519603282416938 * n
        n = h >>> 0
        h -= n
        h *= n
        n = h >>> 0
        h -= n
        n += h * 0x100000000 // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10 // 2^-32
    } else {
      n = 0xefc8249d
    }
  }
  return mash
}

var uheprng = function (seed) {
  return (function () {
    var o = 48 // set the 'order' number of ENTROPY-holding 32-bit values
    var c = 1 // init the 'carry' used by the multiply-with-carry (MWC) algorithm
    var p = o // init the 'phase' (max-1) of the intermediate variable pointer
    var s = new Array(o) // declare our intermediate variables array
    var i // general purpose local
    var j // general purpose local
    var k = 0 // general purpose local

    // when our "uheprng" is initially invoked our PRNG state is initialized from the
    // browser's own local PRNG. This is okay since although its generator might not
    // be wonderful, it's useful for establishing large startup entropy for our usage.
    var mash = new Mash() // get a pointer to our high-performance "Mash" hash

    // fill the array with initial mash hash values
    for (i = 0; i < o; i++) {
      s[i] = mash(Math.random())
    }

    // this PRIVATE (internal access only) function is the heart of the multiply-with-carry
    // (MWC) PRNG algorithm. When called it returns a pseudo-random number in the form of a
    // 32-bit JavaScript fraction (0.0 to <1.0) it is a PRIVATE function used by the default
    // [0-1] return function, and by the random 'string(n)' function which returns 'n'
    // characters from 33 to 126.
    var rawprng = function () {
      if (++p >= o) {
        p = 0
      }
      var t = 1768863 * s[p] + c * 2.3283064365386963e-10 // 2^-32
      // eslint-disable-next-line
      return s[p] = t - (c = t | 0)
    }

    // this EXPORTED function is the default function returned by this library.
    // The values returned are integers in the range from 0 to range-1. We first
    // obtain two 32-bit fractions (from rawprng) to synthesize a single high
    // resolution 53-bit prng (0 to <1), then we multiply this by the caller's
    // "range" param and take the "floor" to return a equally probable integer.
    var random = function (range) {
      return Math.floor(range * (rawprng() + (rawprng() * 0x200000 | 0) * 1.1102230246251565e-16)) // 2^-53
    }

    // this EXPORTED function 'string(n)' returns a pseudo-random string of
    // 'n' printable characters ranging from chr(33) to chr(126) inclusive.
    random.string = function (count) {
      var i
      var s = ''
      for (i = 0; i < count; i++) {
        s += String.fromCharCode(33 + random(94))
      }
      return s
    }

    // this PRIVATE "hash" function is used to evolve the generator's internal
    // entropy state. It is also called by the EXPORTED addEntropy() function
    // which is used to pour entropy into the PRNG.
    var hash = function () {
      var args = Array.prototype.slice.call(arguments)
      for (i = 0; i < args.length; i++) {
        for (j = 0; j < o; j++) {
          s[j] -= mash(args[i])
          if (s[j] < 0) {
            s[j] += 1
          }
        }
      }
    }

    // this EXPORTED "clean string" function removes leading and trailing spaces and non-printing
    // control characters, including any embedded carriage-return (CR) and line-feed (LF) characters,
    // from any string it is handed. this is also used by the 'hashstring' function (below) to help
    // users always obtain the same EFFECTIVE uheprng seeding key.
    random.cleanString = function (inStr) {
      inStr = inStr.replace(/(^\s*)|(\s*$)/gi, '') // remove any/all leading spaces
      inStr = inStr.replace(/[\x00-\x1F]/gi, '') // remove any/all control characters
      inStr = inStr.replace(/\n /, '\n') // remove any/all trailing spaces
      return inStr // return the cleaned up result
    }

    // this EXPORTED "hash string" function hashes the provided character string after first removing
    // any leading or trailing spaces and ignoring any embedded carriage returns (CR) or Line Feeds (LF)
    random.hashString = function (inStr) {
      inStr = random.cleanString(inStr)
      mash(inStr) // use the string to evolve the 'mash' state
      for (i = 0; i < inStr.length; i++) { // scan through the characters in our string
        k = inStr.charCodeAt(i) // get the character code at the location
        for (j = 0; j < o; j++) { // "mash" it into the UHEPRNG state
          s[j] -= mash(k)
          if (s[j] < 0) {
            s[j] += 1
          }
        }
      }
    }

    // this EXPORTED function allows you to seed the random generator.
    random.seed = function (seed) {
      if (typeof seed === 'undefined' || seed === null) {
        seed = Math.random()
      }
      if (typeof seed !== 'string') {
        seed = JSON.stringify(seed, function (key, value) {
          if (typeof value === 'function') {
            return (value).toString()
          }
          return value
        })
      }
      random.initState()
      random.hashString(seed)
    }

    // this handy exported function is used to add entropy to our uheprng at any time
    random.addEntropy = function (/* accept zero or more arguments */) {
      var args = []
      for (i = 0; i < arguments.length; i++) {
        args.push(arguments[i])
      }
      hash((k++) + (new Date().getTime()) + args.join('') + Math.random())
    }

    // if we want to provide a deterministic startup context for our PRNG,
    // but without directly setting the internal state variables, this allows
    // us to initialize the mash hash and PRNG's internal state before providing
    // some hashing input
    random.initState = function () {
      mash() // pass a null arg to force mash hash to init
      for (i = 0; i < o; i++) {
        s[i] = mash(' ') // fill the array with initial mash hash values
      }
      c = 1 // init our multiply-with-carry carry
      p = o // init our phase
    }

    // we use this (optional) exported function to signal the JavaScript interpreter
    // that we're finished using the "Mash" hash function so that it can free up the
    // local "instance variables" is will have been maintaining.  It's not strictly
    // necessary, of course, but it's good JavaScript citizenship.
    random.done = function () {
      mash = null
    }

    // if we called "uheprng" with a seed value, then execute random.seed() before returning
    if (typeof seed !== 'undefined') {
      random.seed(seed)
    }

    // Returns a random integer between 0 (inclusive) and range (exclusive)
    random.range = function (range) {
      return random(range)
    }

    // Returns a random float between 0 (inclusive) and 1 (exclusive)
    random.random = function () {
      return random(Number.MAX_VALUE - 1) / Number.MAX_VALUE
    }

    // Returns a random float between min (inclusive) and max (exclusive)
    random.floatBetween = function (min, max) {
      return random.random() * (max - min) + min
    }

    // Returns a random integer between min (inclusive) and max (inclusive)
    random.intBetween = function (min, max) {
      return Math.floor(random.random() * (max - min + 1)) + min
    }

    // when our main outer "uheprng" function is called, after setting up our
    // initial variables and entropic state, we return an "instance pointer"
    // to the internal anonymous function which can then be used to access
    // the uheprng's various exported functions.  As with the ".done" function
    // above, we should set the returned value to 'null' once we're finished
    // using any of these functions.
    return random
  }())
}

// Modification for use in node:
uheprng.create = function (seed) {
  // eslint-disable-next-line
  return new uheprng(seed)
}
module.exports = uheprng
