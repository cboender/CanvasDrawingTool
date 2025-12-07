class Paint {
	#layers = [];
	#currentTool;
	#tools = {};
	#currentLayer;
	#graphics;
	#canvas;
	#eventCanvas;
	constructor(config) {
		var $this = this;
		var canvas = this.#canvas = config.canvas;
		// TODO pass width, height in with config
		var parentWidth = canvas.parentNode.offsetWidth;
		var parentHeight = canvas.parentNode.offsetHeight;
		canvas.width = parentWidth;
		canvas.height = parentHeight;
		this.#graphics = canvas.getContext("2d");
		
		var eventCanvas = this.#eventCanvas = canvas.cloneNode();
			this.#eventCanvas.id = "event_" + this.#eventCanvas.id;
			canvas.parentNode.appendChild(this.#eventCanvas);
		if (config.image) {
			let width = config.image.width;
			let height = config.image.height
			canvas.width = width;
			canvas.height = height;
			
			canvas.style.left =  Math.max(Math.ceil((parentWidth / 2) - (width /2)), 0) + 'px';
			canvas.style.top =  Math.max(Math.ceil((parentHeight / 2) - (height /2)), 0) + 'px';
			var imageLayer = new Layer({
				painting : $this,
				x : 0,
				y : 0,
				width : width,
				height : height,
				movable : true
			});
			var image = new Image(config.image, 0,0);
			window.image = image;
			imageLayer.addNode(image);
			
			
			config.image.parentNode.removeChild(config.image);
			
			this.#layers.push(imageLayer);
			this.#currentLayer = imageLayer;
			this.draw();
		} else {
			var blanklayer = new Layer({
				painting : $this,
				x : 0,
				y : 0,
				width : parentWidth,
				height : parentHeight,
				movable : false
			});
			
			this.#layers.push(blanklayer);
			this.#currentLayer = blanklayer;
			this.draw();
		}
		
			
		// Initialize Tools
		function addTool(tool) {
			var newTool = new tool(canvas);
			$this.#tools[newTool.name] = newTool;
		}
		addTool(MoveTool);
		addTool(PenTool);
		addTool(LineTool);
		addTool(RectangleTool);
		
		
		var eventGraphics = eventCanvas.getContext("2d");
		// Initialize events
		function bindEvents(name) {
			eventCanvas.addEventListener(name, function(event) {
				if ($this.#currentTool) {
					$this.#currentTool[name].call($this.#currentTool, event, $this.#currentLayer, eventGraphics);
				}
			});
		}
		
		bindEvents('pointerdown');
		bindEvents('pointerup');
		bindEvents('pointermove');
	}
	
	draw() {
		this.#graphics.clearRect(0,0, this.#canvas.width, this.#canvas.height);
		
		for ( let i in this.#layers) {
			this.#layers[i].draw(this.#graphics);
		}
	}
	
	setTool(toolName) {
		this.#currentTool = this.#tools[toolName];
		if (this.#currentTool) {
			this.#eventCanvas.style.cursor = this.#currentTool.cursor;
		}
	}
	
	updateTool(toolName, settingName, settingValue) {
		let tool = this.#tools[toolName];
		tool[settingName] = settingValue;
	}
	
	getImage(mimeType) {
		mimeType = mimeType || 'image/png';
		return this.#canvas.toDataURL(mimeType);
	}
}

class Layer {
	#nodes = [];
	#params = {};
	constructor(config) {
		if (!config.painting) {
			throw "unable to create layer"
		}
		this.#params = {
			painting : config.painting,
			width : config.width || 0,
			height : config.height || 0,
			x : config.x || 0,
			y : config.y || 0,
			movable : config.movable == undefined ? true : config.movable 
		}
	}
	draw(graphics) {
		for ( let i in this.#nodes) {
			this.#nodes[i].draw(graphics, this.#params);
		}
	}

	get x() {
		return this.#params.x;
	}
	
	get y() {
		return this.#params.y;
	}
	
	get width() {
		return this.#params.width;
	}
	
	get height() {
		return this.#params.height;
	}
	
	get movable() {
		return this.#params.movable;
	}
	
	get params() {
		return this.#params;
	}
	
	move(x,y) {
		this.#params.x = x;
		this.#params.y = y;
		this.#params.painting.draw();
	}

	addNode(node) {
		this.#nodes.push(node);
	}
	
	isPointInside(x,y) {
		let param = this.#params;
		
		// Check horizontal coordinates
		if (x < param.x || x > (param.x + param.width)) {
			return false;
		}
		// Check Vertical coordinates
		if (y < param.y || y > (param.y + param.width)) {
			return false;
		} 
		return true;
	}
	
	redraw() {
		this.#params.painting.draw();
	}
}