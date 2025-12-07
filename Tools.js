class Tool {
	constructor(name, cursor) {
		this.name =name;
		this.cursor = cursor || 'default'
	}
	
	pointerdown(event, layer, graphics) {}
	pointerup(event, layer, graphics) {}
	pointermove(event, layer, graphics) {}
}

class MoveTool extends Tool {
	#active = false;
	constructor() {
		super('move', 'move');
	}
	
	pointerdown(event,layer,graphics) {
		if (!layer.movable || !layer.isPointInside(event.offsetX, event.offsetY)) {
			return;
		}
		// TODO get object in layer?
		this.#active = true;
		event.target.setPointerCapture(event.pointerId);
	}
	
	pointerup(event,layer,graphics) {
		if (this.#active) {
			this.#active = false;
			event.target.releasePointerCapture(event.pointerId);
		}
	}
	
	pointermove(event,layer,graphics) {
		if (this.#active) {
			let x = layer.x + event.movementX;
			let y = layer.y + event.movementY;
			layer.move(x,y);
		}
	}
}

class PenTool extends Tool {
	#active = false;
	#outside = false;
	#points = [];
	#path;
	constructor() {
		super('pen', "url('/images/edit.gif'), auto");
		this.width = 5;
		this.color = '000000';
		this.opacity = 100;
	}
	
	pointerdown(event, layer) {
		if (!layer.isPointInside(event.offsetX, event.offsetY)) {
			return;
		}
		
		this.#active = true;
		this.#outside = false;
		event.target.setPointerCapture(event.pointerId);
		let settings = {
				lineWidth : this.width,
				color : this.color,
				opacity : this.opacity
		}
		this.#points = [];
		this.#path = new LinePath(settings,this.#points);
		
		// Move the line to the mouse down position
		let point = {x : event.offsetX - layer.x, y: event.offsetY - layer.y, skip: true};
		this.#points.push(point);
	}
	pointerup(event, layer, graphics) {
		if (this.#active) {
			this.#active = false;
			event.target.releasePointerCapture(event.pointerId);
			
			// Tell it to redraw based on the path created
			graphics.clearRect(0,0,layer.width, layer.height);
			layer.addNode(this.#path);
			layer.redraw();
		}
		
	}
	pointermove(event, layer,graphics) {
		if (this.#active && layer.isPointInside(event.offsetX, event.offsetY)) {
			let point = {x : event.offsetX - layer.x, y: event.offsetY - layer.y};
			if (this.#outside) {
				this.#outside = false;
				point.skip=true;
			}
			this.#points.push(point);
			graphics.clearRect(0,0,layer.width, layer.height);
			this.#path.draw(graphics, layer.params);
		} else if (!layer.isPointInside(event.offsetX, event.offsetY)) {
			this.#outside = true;
		}
		
	}
}

class LineTool extends Tool {
	#active = false;
	#point
	#path
	constructor() {
		super('line', "url('/images/edit.gif'), auto");
		this.width = 5;
		this.color = '000000';
		this.opacity = 100;
	}
	
	pointerdown(event, layer) {
		if (!layer.isPointInside(event.offsetX, event.offsetY)) {
			return;
		}
		this.#active = true;
		event.target.setPointerCapture(event.pointerId);
		let settings = {
				lineWidth : this.width,
				color : this.color,
				opacity : this.opacity
		}
		
		 var start = {x : event.offsetX - layer.x, y: event.offsetY- layer.y};
		this.#point = {x : event.offsetX - layer.x, y: event.offsetY- layer.y};
		this.#path = new Line(settings,start, this.#point);
	}
	pointerup(event, layer, graphics) {
		if (this.#active) {
			this.#active = false;
			event.target.releasePointerCapture(event.pointerId);
			
			// Tell it to redraw based on the path created
			layer.addNode(this.#path);
			layer.redraw();
			graphics.clearRect(0,0,layer.width, layer.height);
		}
		
	}
	pointermove(event, layer,graphics) {
		if (this.#active) {
			this.#point.x = event.offsetX - layer.x;
			this.#point.y = event.offsetY - layer.y;
			graphics.clearRect(0,0,layer.width, layer.height);
			
			this.#path.draw(graphics, layer.params);
		}
	}
}

class RectangleTool extends Tool {
	#active = false;
	#point;
	#path;
	constructor() {
		super('rectangle', "url('/images/edit.gif'), auto");
		this.linewidth = 2;
		this.linecolor = '000000';
		this.fillcolor = '0000FF';
		this.opacity = 75;
		this.fillshape = true;
	}
	
	pointerdown(event, layer) {
		if (!layer.isPointInside(event.offsetX, event.offsetY)) {
			return;
		}
		this.#active = true;
		event.target.setPointerCapture(event.pointerId);
		let settings = {
			linewidth : this.linewidth,
			linecolor : this.linecolor,
			opacity : this.opacity,
			fillcolor : this.fillcolor,
			fillshape : this.fillshape
		}
		var start = {x : event.offsetX - layer.x, y: event.offsetY- layer.y};
		this.#point = {x : event.offsetX - layer.x, y: event.offsetY- layer.y};
		this.#path = new Rectangle(settings,start, {width: 0, height: 0});
	}
	pointerup(event, layer, graphics) {
		if (this.#active) {
			this.#active = false;
			event.target.releasePointerCapture(event.pointerId);
			
			// Tell it to redraw based on the path created
			layer.addNode(this.#path);
			layer.redraw();
			graphics.clearRect(0,0,layer.width, layer.height);
		}
		
	}
	pointermove(event, layer,graphics) {
		if (this.#active) {
			let x = event.offsetX - layer.x;
			let y = event.offsetY - layer.y;
			
			var ps = this.#path.settings;
			var pos = this.#path.start;
			var size = this.#path.size;
			
			size.width = Math.abs(x - this.#point.x);
			size.height = Math.abs(y - this.#point.y);
			
			pos.x = Math.min(x, this.#point.x);
			pos.y = Math.min(y, this.#point.y);
			
			graphics.clearRect(0,0,layer.width, layer.height);
			this.#path.draw(graphics, layer.params);
		}
	}
}