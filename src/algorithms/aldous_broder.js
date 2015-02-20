/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.AldousBroder = (function(superClass) {
  extend(AldousBroder, superClass);

  AldousBroder.prototype.IN = 0x1000;

  function AldousBroder(maze, options) {
    AldousBroder.__super__.constructor.apply(this, arguments);
    this.state = 0;
    this.remaining = this.maze.width * this.maze.height;
  }

  AldousBroder.prototype.isCurrent = function(x, y) {
    return this.x === x && this.y === y;
  };

  AldousBroder.prototype.startStep = function() {
    this.x = this.rand.nextInteger(this.maze.width);
    this.y = this.rand.nextInteger(this.maze.height);
    this.maze.carve(this.x, this.y, this.IN);
    this.updateAt(this.x, this.y);
    this.remaining--;
    this.state = 1;
    return this.carvedOnLastStep = true;
  };

  AldousBroder.prototype.runStep = function() {
    var carved, dir, i, len, nx, ny, ref, ref1, x, y;
    carved = false;
    if (this.remaining > 0) {
      ref = this.rand.randomDirections();
      for (i = 0, len = ref.length; i < len; i++) {
        dir = ref[i];
        nx = this.x + Maze.Direction.dx[dir];
        ny = this.y + Maze.Direction.dy[dir];
        if (this.maze.isValid(nx, ny)) {
          ref1 = [this.x, this.y, nx, ny], x = ref1[0], y = ref1[1], this.x = ref1[2], this.y = ref1[3];
          if (this.maze.isBlank(nx, ny)) {
            this.maze.carve(x, y, dir);
            this.maze.carve(this.x, this.y, Maze.Direction.opposite[dir]);
            this.remaining--;
            carved = true;
            if (this.remaining === 0) {
              delete this.x;
              delete this.y;
            }
          }
          this.updateAt(x, y);
          this.updateAt(nx, ny);
          break;
        }
      }
    }
    if (carved !== this.carvedOnLastStep) {
      this.eventAt(this.x, this.y);
    }
    this.carvedOnLastStep = carved;
    return this.remaining > 0;
  };

  AldousBroder.prototype.step = function() {
    switch (this.state) {
      case 0:
        this.startStep();
        break;
      case 1:
        this.runStep();
    }
    return this.remaining > 0;
  };

  return AldousBroder;

})(Maze.Algorithm);