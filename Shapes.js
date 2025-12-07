class GraphicNode {
	constructor() {
	}
	draw(graphics, parentInfo) {
		throw "draw method not implemented";
	}
	
	hexToRgb(hex) {
		  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		  return result ? {
		    r: parseInt(result[1], 16),
		    g: parseInt(result[2], 16),
		    b: parseInt(result[3], 16)
		  } : null;
		}
}

class Image extends GraphicNode {
	constructor(image, x, y) {
			super();
			this.image = image;
			this.x = x;
			this.y = y;
	}
	
	draw(graphics, parentInfo) {
		let width = parentInfo.width;
		let height = parentInfo.height;
		// TODO only draw within parent bounds
		graphics.drawImage(this.image, this.x+parentInfo.x, this.y+parentInfo.y );
	}
}

class LinePath extends GraphicNode {
	constructor(settings = {}, path = []) {
			super();
			this.settings = settings;
			this.path = path;
	}
	
	draw(graphics, parentInfo) {
		graphics.lineWidth = this.settings.lineWidth || 1;
		var color = '#000000';
		if (this.settings.color) {
			var rgb = this.hexToRgb(this.settings.color);
			color = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (this.settings.opacity / 100) + ')';
		}
		graphics.strokeStyle=color;
		graphics.lineCap = "round";
		
		graphics.beginPath();
		for (let i in this.path) {
			let point = this.path[i];
			if (point.skip) {
				graphics.moveTo(point.x+parentInfo.x, point.y + parentInfo.y);
			} else {
				graphics.lineTo(point.x+parentInfo.x, point.y + parentInfo.y)
			}
		}
		graphics.stroke();
	}
}

class Line extends GraphicNode {
	constructor(settings = {}, startPoint = {x: 0, y: 0}, endPoint = {x: 0, y: 0}) {
			super();
			this.settings = settings;
			this.start = startPoint;
			this.end= endPoint;
	}
	
	draw(graphics, parentInfo) {
		graphics.lineWidth = this.settings.lineWidth || 1;
		var color = '#000000';
		if (this.settings.color) {
			var rgb = this.hexToRgb(this.settings.color);
			color = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (this.settings.opacity / 100) + ')';
		}
		graphics.strokeStyle=color;
		graphics.lineCap = "butt";
		
		graphics.save();
		graphics.rect(parentInfo.x, parentInfo.y, parentInfo.width, parentInfo.height);
		graphics.clip();
		graphics.beginPath();
		graphics.moveTo(this.start.x+parentInfo.x, this.start.y + parentInfo.y);
		graphics.lineTo(this.end.x+parentInfo.x, this.end.y + parentInfo.y);
		graphics.stroke();
		graphics.restore();
	}
}

class Rectangle extends GraphicNode {
	constructor(settings = {}, startPoint = {x: 0, y: 0}, size = {width: 0, height: 0}) {
			super();
			this.settings = settings;
			this.start = startPoint;
			this.size= size;
	}
	
	draw(graphics, parentInfo) {
		graphics.save();
		graphics.rect(parentInfo.x, parentInfo.y, parentInfo.width, parentInfo.height);
		graphics.clip();
		
		if (this.settings.linewidth > 0) {
			graphics.lineWidth = this.settings.linewidth || 1;
		
			if (this.settings.linecolor) {
				var lineColor = '#000000';
				let rgb = this.hexToRgb(this.settings.linecolor);
				lineColor = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (this.settings.opacity / 100) + ')';
				
				graphics.strokeStyle=lineColor;
				graphics.lineCap = "butt";
				graphics.strokeRect(this.start.x+parentInfo.x, this.start.y+ parentInfo.y, this.size.width, this.size.height);
			}
		}
		
		if (this.settings.fillshape){
			var shapeColor = '#FFFFFF';
			let rgb = this.hexToRgb(this.settings.fillcolor);
			shapeColor = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (this.settings.opacity / 100) + ')';
			
			graphics.fillStyle=shapeColor;
			graphics.fillRect(this.start.x+parentInfo.x, this.start.y+ parentInfo.y, this.size.width, this.size.height);
		}
		
		graphics.restore();
	}
}

