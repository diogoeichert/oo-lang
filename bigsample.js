(function () {
	"use strict";

	var ParentThing = (function () {
		function ParentThing() {

		}

		return ParentThing;
	})();

	var Thing = (function () {
		function Thing() {
			ParentThing.prototype.call(this);
			this.number = 12345;
		}

		Thing.prototype = Object.create(ParentThing.prototype);

		Thing.prototype.do = function (list) {
			for (var i = 0; i < list.length; ++i) {
				console.log(list[i]);
			}
		};

		return Thing;
	})();

	function blah() {
		var t = new Thing();
		t.do();
	}

	function main() {
		blah();
	}

	main();
})();
