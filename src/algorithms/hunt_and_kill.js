/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.HuntAndKill = (function(superClass) {
  extend(HuntAndKill, superClass);

  HuntAndKill.prototype.IN = 0x1000;

  function HuntAndKill(maze, options) {
    HuntAndKill.__super__.constructor.apply(this, arguments);
    this.state = 0;
  }

  HuntAndKill.prototype.isCurrent = function(x, y) {
    var ref;
    return ((ref = this.x) != null ? ref : x) === x && this.y === y;
  };

  HuntAndKill.prototype.isWalking = function() {
    return this.state === 1;
  };

  HuntAndKill.prototype.isHunting = function() {
    return this.state === 2;
  };

  HuntAndKill.prototype.callbackRow = function(y) {
    var i, ref, results, x;
    results = [];
    for (x = i = 0, ref = this.maze.width; 0 <= ref ? i < ref : i > ref; x = 0 <= ref ? ++i : --i) {
      results.push(this.updateAt(x, y));
    }
    return results;
  };

  HuntAndKill.prototype.startStep = function() {
    this.x = this.rand.nextInteger(this.maze.width);
    this.y = this.rand.nextInteger(this.maze.height);
    this.maze.carve(this.x, this.y, this.IN);
    this.updateAt(this.x, this.y);
    return this.state = 1;
  };

  HuntAndKill.prototype.walkStep = function() {
    var direction, i, len, nx, ny, ref, ref1, ref2, x, y;
    ref = this.rand.randomDirections();
    for (i = 0, len = ref.length; i < len; i++) {
      direction = ref[i];
      nx = this.x + Maze.Direction.dx[direction];
      ny = this.y + Maze.Direction.dy[direction];
      if (this.maze.isValid(nx, ny)) {
        if (this.maze.isBlank(nx, ny)) {
          ref1 = [this.x, this.y, nx, ny], x = ref1[0], y = ref1[1], this.x = ref1[2], this.y = ref1[3];
          this.maze.carve(x, y, direction);
          this.maze.carve(nx, ny, Maze.Direction.opposite[direction]);
          this.updateAt(x, y);
          this.updateAt(nx, ny);
          return;
        } else if (this.canWeave(direction, nx, ny)) {
          this.performWeave(direction, this.x, this.y, (function(_this) {
            return function(x, y) {
              var ref2;
              return ref2 = [_this.x, _this.y, x, y], x = ref2[0], y = ref2[1], _this.x = ref2[2], _this.y = ref2[3], ref2;
            };
          })(this));
          return;
        }
      }
    }
    ref2 = [this.x, this.y], x = ref2[0], y = ref2[1];
    delete this.x;
    delete this.y;
    this.updateAt(x, y);
    this.eventAt(x, y);
    this.y = 0;
    this.state = 2;
    return this.callbackRow(0);
  };

  HuntAndKill.prototype.huntStep = function() {
    var direction, i, neighbors, nx, ny, ref, x;
    for (x = i = 0, ref = this.maze.width; 0 <= ref ? i < ref : i > ref; x = 0 <= ref ? ++i : --i) {
      if (this.maze.isBlank(x, this.y)) {
        neighbors = [];
        if (this.y > 0 && !this.maze.isBlank(x, this.y - 1)) {
          neighbors.push(Maze.Direction.N);
        }
        if (x > 0 && !this.maze.isBlank(x - 1, this.y)) {
          neighbors.push(Maze.Direction.W);
        }
        if (this.y + 1 < this.maze.height && !this.maze.isBlank(x, this.y + 1)) {
          neighbors.push(Maze.Direction.S);
        }
        if (x + 1 < this.maze.width && !this.maze.isBlank(x + 1, this.y)) {
          neighbors.push(Maze.Direction.E);
        }
        direction = this.rand.randomElement(neighbors);
        if (direction) {
          this.x = x;
          nx = this.x + Maze.Direction.dx[direction];
          ny = this.y + Maze.Direction.dy[direction];
          this.maze.carve(this.x, this.y, direction);
          this.maze.carve(nx, ny, Maze.Direction.opposite[direction]);
          this.state = 1;
          this.updateAt(nx, ny);
          this.callbackRow(this.y);
          this.eventAt(nx, ny);
          return;
        }
      }
    }
    this.y++;
    this.callbackRow(this.y - 1);
    if (this.y >= this.maze.height) {
      this.state = 3;
      delete this.x;
      return delete this.y;
    } else {
      return this.callbackRow(this.y);
    }
  };

  HuntAndKill.prototype.step = function() {
    switch (this.state) {
      case 0:
        this.startStep();
        break;
      case 1:
        this.walkStep();
        break;
      case 2:
        this.huntStep();
    }
    return this.state !== 3;
  };

  return HuntAndKill;

})(Maze.Algorithm);