/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.Houston = (function(superClass) {
  extend(Houston, superClass);

  function Houston(maze, options) {
    Houston.__super__.constructor.apply(this, arguments);
    this.options = options;
    this.threshold = 2 * this.maze.width * this.maze.height / 3;
  }

  Houston.prototype.isCurrent = function(x, y) {
    return this.worker.isCurrent(x, y);
  };

  Houston.prototype.isVisited = function(x, y) {
    return this.worker.isVisited(x, y);
  };

  Houston.prototype.step = function() {
    var ref, wilsons, x, y;
    if (this.worker == null) {
      this.worker = new Maze.Algorithms.AldousBroder(this.maze, this.options);
      this.worker.onUpdate(this.updateCallback);
      this.worker.onEvent(this.eventCallback);
    }
    if (this.worker.remaining < this.threshold) {
      ref = [this.worker.x, this.worker.y], x = ref[0], y = ref[1];
      delete this.worker.x;
      delete this.worker.y;
      this.updateAt(x, y);
      this.eventAt(x, y);
      wilsons = new Maze.Algorithms.Wilson(this.maze, this.options);
      wilsons.onUpdate(this.updateCallback);
      wilsons.onEvent(this.eventCallback);
      wilsons.state = 1;
      wilsons.remaining = this.worker.remaining;
      this.worker = wilsons;
      this.step = function() {
        return this.worker.step();
      };
    }
    return this.worker.step();
  };

  return Houston;

})(Maze.Algorithm);