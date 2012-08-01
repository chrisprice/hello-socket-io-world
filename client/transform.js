define([ './jquery' ], function($) {

	var prefix = null;

	[ 'Webkit', 'Moz', 'Ms', 'O' ].forEach(function(p) {
		if (p + 'Transform' in document.createElement('span').style) {
			prefix = p;
		}
	});

	function applyPrefixed(element, name, value, append) {
		if (prefix) {
			name = prefix + name[0].toUpperCase() + name.substr(1);
		}
		if (append) {
			value = element.style[name] + ' ' + value;
		}
		element.style[name] = value;
	}

	function numberToDeg(val) {
		return typeof val === 'number' ? val.toFixed(5) + 'deg' : val;
	}

	function numberToPx(val) {
		return typeof val === 'number' ? val.toFixed(5) + 'px' : val;
	}

	$.extend($.fn, {
		translate : function(x, y, z) {
			$.each(this, function() {
				applyPrefixed(this, 'transform', 'translate3d(' + numberToPx(x) + ','
						+ numberToPx(y) + ',' + numberToPx(z) + ')', true);
			});
			return this;
		},
		scale : function(f) {
			$.each(this, function() {
				applyPrefixed(this, 'transform', 'scale(' + f + ')', true);
			});
			return this;
		},
		rotateX : function(a) {
			$.each(this, function() {
				applyPrefixed(this, 'transform', 'rotateX(' + numberToDeg(a) + ')', true);
			});
			return this;
		},
		rotateY : function(a) {
			$.each(this, function() {
				applyPrefixed(this, 'transform', 'rotateY(' + numberToDeg(a) + ')', true);
			});
			return this;
		},
		prefix : function(name, value, append) {
			$.each(this, function() {
				applyPrefixed(this, name, numberToPx(value), append);
			});
			return this;
		},
		preserve3d : function() {
			$.each(this, function() {
				applyPrefixed(this, 'transformStyle', 'preserve-3d');
			});
			return this;
		},
		origin : function(x, y) {
			$.each(this, function() {
				applyPrefixed(this, 'transformOrigin', numberToPx(x) + ' ' + numberToPx(y));
			});
			return this;
		},
		perspective : function(value) {
			$.each(this, function() {
				applyPrefixed(this, 'perspective', value.toFixed(0));
			});
			return this;
		},
		transform : function(t) {
			$.each(this, function() {
				applyPrefixed(this, 'transform', t);
			});
			return this;
		},
		clearTransform : function() {
			$.each(this, function() {
				applyPrefixed(this, 'transform', '');
			});
			return this;
		}
	});

	function useMouseRotationControl() {
		$(document.body).css({
			position : 'absolute',
			top : 0,
			bottom : 0,
			left : 0,
			right : 0
		}).preserve3d().origin('50%', '50%').perspective(100000);
		var loc = null, rot = {
			x : 0,
			y : 0
		};
		$(document).mousedown(function(e) {
			loc = {
				x : e.pageX,
				y : e.pageY
			};
			e.preventDefault();
		}).mouseup(function(e) {
			loc = null;
		}).mousemove(function(e) {
			if (!loc) {
				return;
			}
			var xrel = e.pageX - loc.x;
			var yrel = loc.y - e.pageY;
			rot.x += yrel * 0.01;
			rot.y += xrel * 0.01;
			$(document.body).clearTransform().rotateX(rot.x).rotateY(rot.y);
		});
	}

	return {
		useMouseRotationControl : useMouseRotationControl
	};
});