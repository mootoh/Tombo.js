import "js/web.jsx";
import "../Eye.jsx";
import "../Shape.jsx";
import "../../Tombo.jsx";
import "../../BasicTypes.jsx";

/**
 * AnimationImageShape class
 * 
 * <p>AnimationImageShape has only one image which contains animation frames, and draw the specified frame's image </p>
 *
 * @author Takuo KIHIRA <t-kihira@broadtail.jp>
 */
class AnimationImageShape implements Shape {
	var bounds: Rect;
	var isMutable = true;
	var isImage = true;
	var dirty = true;
	var lastUpdatedFrame = 0 as int;

	var _cimg: HTMLCanvasElement;
	var _img: HTMLImageElement;
	var _imgName: string;
	var _isFixedScale = false;
	var _id: int;
	var _frame = 0;
	
	var _cols: number;
	var _rows: number;
	
	var _partialWidth: number;
	var _partialHeight: number;
	
	var _color = 0 as int;
	var _filteredImage = null as HTMLCanvasElement;
	var _filteringColor = 0 as int;
	
	/**
	 * create Shape with Image Element
	 * @param img the image element which is drawed
	 * //@param destWidth the fixed width size of the destination image (optional)
	 * //@param destHeight the fixed height size of the destination image (optional)
	 */
	function constructor(img: HTMLImageElement, frameCols: number, frameRows: number, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._img = img;
		if(!img.width || !img.height) {
			Tombo.warn("[ImageShape#constructor] image is not initialized");
		}
		this.bounds = new Rect(0, 0, destWidth ?: img.width / frameCols, destHeight ?:img.height / frameRows);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
		this._cols = frameCols;
		this._rows = frameRows;
		this._partialWidth = img.width / this._cols;
		this._partialHeight = img.height / this._rows;
	}

	function constructor(img: string, frameCols: number, frameRows: number, width: number, height: number, destWidth: number = 0, destHeight: number = 0) {
		this._id = Eye._shapeCounter++;
		this._imgName = img;
		this.bounds = new Rect(0, 0, destWidth ?: width / frameCols, destHeight ?: height / frameRows);
		if(destWidth || destHeight) {
			this._isFixedScale = true;
		}
		this._cols = frameCols;
		this._rows = frameRows;
		this._partialWidth = width / this._cols;
		this._partialHeight = height / this._rows;
	}

	// for streaming
	function constructor(id: number, imageId: string, bounds: Array.<variant>, isFixedScale: boolean, cols: number, rows: number, frame: number, imgMap: Map.<HTMLCanvasElement>, color: number) {
		this._id = id;
		this._imgName = imageId;
		this._cimg = imgMap[imageId] as HTMLCanvasElement;
		var b = bounds;
		this.bounds = new Rect(b[0] as number, b[1] as number, (b[2] == "-1")? this._cimg.width: b[2] as number, (b[3] == "-1")? this._cimg.height: b[3] as number);
		this._isFixedScale = isFixedScale;
		this._cols = cols;
		this._rows = rows;
		this._frame = frame;
		this._color = color;

		this._partialWidth = this._cimg.width / this._cols;
		this._partialHeight = this._cimg.height / this._rows;
	}

	function setColor(color: int): void {
		this._color = color;
	}

	function setFrame(frame: number): void {
		if (this._frame != frame) {
			this.dirty = true;
		}
		this._frame = frame;
	}
	function getFrame(): number{
		return this._frame;
	}

	override function draw(ctx: CanvasRenderingContext2D, color: number): void {
		var x = (this._frame % this._cols) * this._partialWidth;
		var y = ((this._frame / this._cols) as int) * this._partialHeight;
		
		var isFiltering = (Color.getA(this._color) != 0);
		if(isFiltering) {
			if(this._color != this._filteringColor) {
				this._filteringColor = this._color;
				var width = (this._img)? this._img.width: this._cimg.width;
				var height = (this._img)? this._img.height: this._cimg.height;
				// filtering with color
				var canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
				canvas.width = width;
				canvas.height = height;
				var cctx = canvas.getContext("2d") as CanvasRenderingContext2D;
				if(this._img) {
					cctx.drawImage(this._img, 0, 0);
				} else {
					cctx.drawImage(this._cimg, 0, 0);
				}
				cctx.globalCompositeOperation = "source-atop";
				cctx.fillStyle = Color.stringify(this._color);
				cctx.fillRect(0, 0, width, height);
				this._filteredImage = canvas;
			}
		}
		
		if(this._isFixedScale) {
			if(isFiltering) {
				ctx.drawImage(this._filteredImage, x, y, this._partialWidth, this._partialHeight, 0, 0, this.bounds.width, this.bounds.height);
			} else {
				if(this._img) {
					ctx.drawImage(this._img, x, y, this._partialWidth, this._partialHeight, 0, 0, this.bounds.width, this.bounds.height);
				} else {
					if(!this._cimg) {
						log "Fail to draw: " + this._imgName;
						return;
					}
					ctx.drawImage(this._cimg, x, y, this._partialWidth, this._partialHeight, 0, 0, this.bounds.width, this.bounds.height);
				}
			}
		} else {
			if(isFiltering) {
				ctx.drawImage(this._filteredImage, x, y, this._partialWidth, this._partialHeight, 0, 0, this._partialWidth, this._partialHeight);
			} else {
				if(this._img) {
					ctx.drawImage(this._img, x, y, this._partialWidth, this._partialHeight, 0, 0, this._partialWidth, this._partialHeight);
				} else {
					if(!this._cimg) {
						log "Fail to draw: " + this._imgName;
						return;
					}
					ctx.drawImage(this._cimg, x, y, this._partialWidth, this._partialHeight, 0, 0, this._partialWidth, this._partialHeight);
				}
			}
		}
	}
	
	override function getType(): string {
		return "AnimationImageShape";
	}
}
