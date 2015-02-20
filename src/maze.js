/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var Maze;

Maze = (function() {
  function Maze(width, height, algorithm, options) {
    this.width = width;
    this.height = height;
    if (options == null) {
      options = {};
    }
    this.grid = new Maze.Grid(this.width, this.height);
    this.rand = options.rng || new MersenneTwister(options.seed);
    this.isWeave = options.weave;
    if (this.rand.randomElement == null) {
      this.rand.randomElement = function(list) {
        return list[this.nextInteger(list.length)];
      };
      this.rand.removeRandomElement = function(list) {
        var results;
        results = list.splice(this.nextInteger(list.length), 1);
        if (results) {
          return results[0];
        }
      };
      this.rand.randomizeList = function(list) {
        var i, j, ref;
        i = list.length - 1;
        while (i > 0) {
          j = this.nextInteger(i + 1);
          ref = [list[j], list[i]], list[i] = ref[0], list[j] = ref[1];
          i--;
        }
        return list;
      };
      this.rand.randomDirections = function() {
        return this.randomizeList(Maze.Direction.List.slice(0));
      };
    }
    this.algorithm = new algorithm(this, options);
  }

  Maze.prototype.onUpdate = function(fn) {
    return this.algorithm.onUpdate(fn);
  };

  Maze.prototype.onEvent = function(fn) {
    return this.algorithm.onEvent(fn);
  };

  Maze.prototype.generate = function() {
    var results1;
    results1 = [];
    while (true) {
      if (!this.step()) {
        break;
      } else {
        results1.push(void 0);
      }
    }
    return results1;
  };

  Maze.prototype.step = function() {
    return this.algorithm.step();
  };

  Maze.prototype.isEast = function(x, y) {
    return this.grid.isMarked(x, y, Maze.Direction.E);
  };

  Maze.prototype.isWest = function(x, y) {
    return this.grid.isMarked(x, y, Maze.Direction.W);
  };

  Maze.prototype.isNorth = function(x, y) {
    return this.grid.isMarked(x, y, Maze.Direction.N);
  };

  Maze.prototype.isSouth = function(x, y) {
    return this.grid.isMarked(x, y, Maze.Direction.S);
  };

  Maze.prototype.isUnder = function(x, y) {
    return this.grid.isMarked(x, y, Maze.Direction.U);
  };

  Maze.prototype.isValid = function(x, y) {
    return (0 <= x && x < this.width) && (0 <= y && y < this.height);
  };

  Maze.prototype.carve = function(x, y, dir) {
    return this.grid.mark(x, y, dir);
  };

  Maze.prototype.uncarve = function(x, y, dir) {
    return this.grid.clear(x, y, dir);
  };

  Maze.prototype.isSet = function(x, y, dir) {
    return this.grid.isMarked(x, y, dir);
  };

  Maze.prototype.isBlank = function(x, y) {
    return this.grid.at(x, y) === 0;
  };

  Maze.prototype.isPerpendicular = function(x, y, dir) {
    return (this.grid.at(x, y) & Maze.Direction.Mask) === Maze.Direction.cross[dir];
  };

  return Maze;

})();

Maze.Algorithms = {};

Maze.Algorithm = (function() {
  function Algorithm(maze1, options) {
    this.maze = maze1;
    if (options == null) {
      options = {};
    }
    this.updateCallback = function(maze, x, y) {};
    this.eventCallback = function(maze, x, y) {};
    this.rand = this.maze.rand;
  }

  Algorithm.prototype.onUpdate = function(fn) {
    return this.updateCallback = fn;
  };

  Algorithm.prototype.onEvent = function(fn) {
    return this.eventCallback = fn;
  };

  Algorithm.prototype.updateAt = function(x, y) {
    return this.updateCallback(this.maze, parseInt(x), parseInt(y));
  };

  Algorithm.prototype.eventAt = function(x, y) {
    return this.eventCallback(this.maze, parseInt(x), parseInt(y));
  };

  Algorithm.prototype.canWeave = function(dir, thruX, thruY) {
    var nx, ny;
    if (this.maze.isWeave && this.maze.isPerpendicular(thruX, thruY, dir)) {
      nx = thruX + Maze.Direction.dx[dir];
      ny = thruY + Maze.Direction.dy[dir];
      return this.maze.isValid(nx, ny) && this.maze.isBlank(nx, ny);
    }
  };

  Algorithm.prototype.performThruWeave = function(thruX, thruY) {
    if (this.rand.nextBoolean()) {
      return this.maze.carve(thruX, thruY, Maze.Direction.U);
    } else if (this.maze.isNorth(thruX, thruY)) {
      this.maze.uncarve(thruX, thruY, Maze.Direction.N | Maze.Direction.S);
      return this.maze.carve(thruX, thruY, Maze.Direction.E | Maze.Direction.W | Maze.Direction.U);
    } else {
      this.maze.uncarve(thruX, thruY, Maze.Direction.E | Maze.Direction.W);
      return this.maze.carve(thruX, thruY, Maze.Direction.N | Maze.Direction.S | Maze.Direction.U);
    }
  };

  Algorithm.prototype.performWeave = function(dir, fromX, fromY, callback) {
    var thruX, thruY, toX, toY;
    thruX = fromX + Maze.Direction.dx[dir];
    thruY = fromY + Maze.Direction.dy[dir];
    toX = thruX + Maze.Direction.dx[dir];
    toY = thruY + Maze.Direction.dy[dir];
    this.maze.carve(fromX, fromY, dir);
    this.maze.carve(toX, toY, Maze.Direction.opposite[dir]);
    this.performThruWeave(thruX, thruY);
    if (callback) {
      callback(toX, toY);
    }
    this.updateAt(fromX, fromY);
    this.updateAt(thruX, thruY);
    return this.updateAt(toX, toY);
  };

  return Algorithm;

})();

Maze.Direction = {
  N: 0x01,
  S: 0x02,
  E: 0x04,
  W: 0x08,
  U: 0x10,
  Mask: 0x01 | 0x02 | 0x04 | 0x08 | 0x10,
  List: [1, 2, 4, 8],
  dx: {
    1: 0,
    2: 0,
    4: 1,
    8: -1
  },
  dy: {
    1: -1,
    2: 1,
    4: 0,
    8: 0
  },
  opposite: {
    1: 2,
    2: 1,
    4: 8,
    8: 4
  },
  cross: {
    1: 4 | 8,
    2: 4 | 8,
    4: 1 | 2,
    8: 1 | 2
  }
};

Maze.Grid = (function() {
  function Grid(width, height) {
    var x, y;
    this.width = width;
    this.height = height;
    this.data = (function() {
      var k, ref, results1;
      results1 = [];
      for (y = k = 1, ref = this.height; 1 <= ref ? k <= ref : k >= ref; y = 1 <= ref ? ++k : --k) {
        results1.push((function() {
          var l, ref1, results2;
          results2 = [];
          for (x = l = 1, ref1 = this.width; 1 <= ref1 ? l <= ref1 : l >= ref1; x = 1 <= ref1 ? ++l : --l) {
            results2.push(0);
          }
          return results2;
        }).call(this));
      }
      return results1;
    }).call(this);
  }

  Grid.prototype.at = function(x, y) {
    return this.data[y][x];
  };

  Grid.prototype.mark = function(x, y, bits) {
    return this.data[y][x] |= bits;
  };

  Grid.prototype.clear = function(x, y, bits) {
    return this.data[y][x] &= ~bits;
  };

  Grid.prototype.isMarked = function(x, y, bits) {
    return (this.data[y][x] & bits) === bits;
  };

  return Grid;

})();
