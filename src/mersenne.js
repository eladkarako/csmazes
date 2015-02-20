/*
This implementation of the Mersenne Twister is a port of the JavaScript
version by Y. Okada. The JavaScript version was itself a port of a
C implementation, by Takuji Nishimura and Makoto Matsumoto.

CoffeeScript port by: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var MersenneTwister;

MersenneTwister = (function() {
  MersenneTwister.prototype.N = 624;

  MersenneTwister.prototype.M = 397;

  MersenneTwister.prototype.MATRIX_A = 0x9908b0df;

  MersenneTwister.prototype.UPPER_MASK = 0x80000000;

  MersenneTwister.prototype.LOWER_MASK = 0x7fffffff;

  function MersenneTwister(seed) {
    this.mt = new Array(this.N);
    this.setSeed(seed);
  }

  MersenneTwister.prototype.unsigned32 = function(n1) {
    if (n1 < 0) {
      return (n1 ^ this.UPPER_MASK) + this.UPPER_MASK;
    } else {
      return n1;
    }
  };

  MersenneTwister.prototype.subtraction32 = function(n1, n2) {
    if (n1 < n2) {
      return this.unsigned32((0x100000000 - (n2 - n1)) % 0xffffffff);
    } else {
      return n1 - n2;
    }
  };

  MersenneTwister.prototype.addition32 = function(n1, n2) {
    return this.unsigned32((n1 + n2) & 0xffffffff);
  };

  MersenneTwister.prototype.multiplication32 = function(n1, n2) {
    var i, l, sum;
    sum = 0;
    for (i = l = 0; l < 32; i = ++l) {
      if ((n1 >>> i) & 0x1) {
        sum = this.addition32(sum, this.unsigned32(n2 << i));
      }
    }
    return sum;
  };

  MersenneTwister.prototype.setSeed = function(seed) {
    if (!seed || typeof seed === "number") {
      return this.seedWithInteger(seed);
    } else {
      return this.seedWithArray(seed);
    }
  };

  MersenneTwister.prototype.defaultSeed = function() {
    var currentDate;
    currentDate = new Date();
    return currentDate.getMinutes() * 60000 + currentDate.getSeconds() * 1000 + currentDate.getMilliseconds();
  };

  MersenneTwister.prototype.seedWithInteger = function(seed) {
    var results;
    this.seed = seed != null ? seed : this.defaultSeed();
    this.mt[0] = this.unsigned32(this.seed & 0xffffffff);
    this.mti = 1;
    results = [];
    while (this.mti < this.N) {
      this.mt[this.mti] = this.addition32(this.multiplication32(1812433253, this.unsigned32(this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30))), this.mti);
      this.mti[this.mti] = this.unsigned32(this.mt[this.mti] & 0xffffffff);
      results.push(this.mti++);
    }
    return results;
  };

  MersenneTwister.prototype.seedWithArray = function(key) {
    var _m, i, j, k;
    this.seedWithInteger(19650218);
    i = 1;
    j = 0;
    k = this.N > key.length ? this.N : key.length;
    while (k > 0) {
      _m = this.multiplication32(this.unsigned32(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)), 1664525);
      this.mt[i] = this.addition32(this.addition32(this.unsigned32(this.mt[i] ^ _m), key[j]), j);
      this.mt[i] = this.unsigned32(this.mt[i] & 0xffffffff);
      i++;
      j++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
      if (j >= key.length) {
        j = 0;
      }
      k--;
    }
    k = this.N - 1;
    while (k > 0) {
      this.mt[i] = this.subtraction32(this.unsigned32(this.mt[i] ^ this.multiplication32(this.unsigned32(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)), 1566083941)), i);
      this.mt[i] = this.unsigned32(this.mt[i] & 0xffffffff);
      i++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
    }
    return this.mt[0] = 0x80000000;
  };

  MersenneTwister.prototype.nextInteger = function(upper) {
    var kk, mag01, y;
    if ((upper != null ? upper : 1) < 1) {
      return 0;
    }
    mag01 = [0, this.MATRIX_A];
    if (this.mti >= this.N) {
      kk = 0;
      while (kk < this.N - this.M) {
        y = this.unsigned32((this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK));
        this.mt[kk] = this.unsigned32(this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1]);
        kk++;
      }
      while (kk < this.N - 1) {
        y = this.unsigned32((this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK));
        this.mt[kk] = this.unsigned32(this.mt[kk + this.M - this.N] ^ (y >>> 1) ^ mag01[y & 0x1]);
        kk++;
      }
      y = this.unsigned32((this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK));
      this.mt[this.N - 1] = this.unsigned32(this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1]);
      this.mti = 0;
    }
    y = this.mt[this.mti++];
    y = this.unsigned32(y ^ (y >>> 11));
    y = this.unsigned32(y ^ ((y << 7) & 0x9d2c5680));
    y = this.unsigned32(y ^ ((y << 15) & 0xefc60000));
    return this.unsigned32(y ^ (y >>> 18)) % (upper != null ? upper : 0x100000000);
  };

  MersenneTwister.prototype.nextFloat = function() {
    return this.nextInteger() / 0xffffffff;
  };

  MersenneTwister.prototype.nextBoolean = function() {
    return this.nextInteger() % 2 === 0;
  };

  return MersenneTwister;

})();
