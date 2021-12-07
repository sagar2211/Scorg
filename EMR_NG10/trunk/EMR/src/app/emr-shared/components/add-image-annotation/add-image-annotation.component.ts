import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ImageAnnotationService } from './../../../public/services/image-annotation.service';
import { environment } from './../../../../environments/environment';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input } from '@angular/core';
import 'fabric';
declare const fabric: any;

@Component({
  selector: 'app-add-image-annotation',
  templateUrl: './add-image-annotation.component.html',
  styleUrls: ['./add-image-annotation.component.scss']
})
export class AddImageAnnotationComponent implements OnInit {
  // addAnnotationFrm: FormGroup;
  @Input() imagePath = '';
  @Input() source = '';
  @Input() docSpetialityImageList = [];
  @Input() imageName = '';
  @Input() annotationDetail = '';
  @Input() chartDetailId: number;
  fileServePath = '';
  canvas: any;
  file: File = null;
  pointer: any;
  props: any = {
    canvasFill: '#ffffff',
    canvasImage: '',
    id: null,
    opacity: null,
    fill: '#000000',
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: '',
    pencilStrokeWidth: 2,
    pencilStrokeColor: '#000000',
    stroke: '#000000',
    strokeWidth: 2
  };
  selectedPattern = 'pattern-0.png';
  selectedShape = '';
  isDrawingMode = false;
  isTextMode = false;
  textString: string;
  url: any;
  size: any = {
    width: 550,
    height: 600
  };
  undo = [];
  redo = [];

  json: any;
  globalEditor = false;
  textEditor = false;
  imageEditor = false;
  figureEditor = false;
  lineEditor = false;
  selected: any;
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  isDown = false;
  isRedoing = false;
  patternList = [
    { id: 0, pattern_img: 'pattern-0.png', pattern_name: 'None' },
    { id: 1, pattern_img: 'pattern-1.png', pattern_name: 'Pattern 1', title: 'Solid Circle', class: 'solid-circle' },
    { id: 2, pattern_img: 'pattern-1_1x.png', pattern_name: 'Pattern 2', title: 'Solid Circle', class: 'solid-circle' },
    { id: 3, pattern_img: 'pattern-1_2x.png', pattern_name: 'Pattern 3', title: 'Solid Circle', class: 'solid-circle' },
    { id: 4, pattern_img: 'pattern-2.png', pattern_name: 'Pattern 4', title: 'Hollow Circle', class: 'hollow-circle' },
    { id: 5, pattern_img: 'pattern-2_1x.png', pattern_name: 'Pattern 5', title: 'Hollow Circle', class: 'hollow-circle' },
    { id: 6, pattern_img: 'pattern-2_2x.png', pattern_name: 'Pattern 6', title: 'Hollow Circle', class: 'hollow-circle' },
    { id: 7, pattern_img: 'pattern-3.png', pattern_name: 'Pattern 7', title: 'Cross Line', class: 'cross-line' },
    { id: 8, pattern_img: 'pattern-3_1x.png', pattern_name: 'Pattern 8', title: 'Cross Line', class: 'cross-line' },
    { id: 9, pattern_img: 'pattern-3_2x.png', pattern_name: 'Pattern 9', title: 'Cross Line', class: 'cross-line' },
    { id: 10, pattern_img: 'pattern-4.png', pattern_name: 'Pattern 10', title: 'Hollow Square', class: 'hollow-square' },
    { id: 11, pattern_img: 'pattern-4_1x.png', pattern_name: 'Pattern 11', title: 'Hollow Square', class: 'hollow-square' },
    { id: 12, pattern_img: 'pattern-4_2x.png', pattern_name: 'Pattern 12', title: 'Hollow Square', class: 'hollow-square' },
    { id: 13, pattern_img: 'pattern-5.png', pattern_name: 'Pattern 13', title: 'Vertical Line', class: 'vertical-line' },
    { id: 14, pattern_img: 'pattern-5_1x.png', pattern_name: 'Pattern 14', title: 'Vertical Line', class: 'vertical-line' },
    { id: 15, pattern_img: 'pattern-5_2x.png', pattern_name: 'Pattern 15', title: 'Vertical Line', class: 'vertical-line' },
    { id: 16, pattern_img: 'pattern-6.png', pattern_name: 'Pattern 16', title: 'Vertical Horizantal Line', class: 'ver-hor-line' },
    { id: 17, pattern_img: 'pattern-6_1x.png', pattern_name: 'Pattern 17', title: 'Vertical Horizantal Line', class: 'ver-hor-line' },
    { id: 18, pattern_img: 'pattern-6_2x.png', pattern_name: 'Pattern 18', title: 'Vertical Horizantal Line', class: 'ver-hor-line' },
    { id: 19, pattern_img: 'pattern-7.png', pattern_name: 'Pattern 19', title: 'Horizantal Line', class: 'horizantal-line' },
    { id: 20, pattern_img: 'pattern-7_1x.png', pattern_name: 'Pattern 20', title: 'Horizantal Line', class: 'horizantal-line' },
    { id: 21, pattern_img: 'pattern-7_2x.png', pattern_name: 'Pattern 21', title: 'Horizantal Line', class: 'horizantal-line' },
    { id: 22, pattern_img: 'pattern-8.png', pattern_name: 'Pattern 22', title: 'briks', class: 'briks' },
    { id: 23, pattern_img: 'pattern-8_1x.png', pattern_name: 'Pattern 23', title: 'briks', class: 'briks' },
    { id: 24, pattern_img: 'pattern-8_2x.png', pattern_name: 'Pattern 24', title: 'briks', class: 'briks' },
    { id: 25, pattern_img: 'pattern-9.png', pattern_name: 'Pattern 25', title: 'forward Cross Line2', class: 'forward-cross-line2' },
    { id: 26, pattern_img: 'pattern-9_1x.png', pattern_name: 'Pattern 26', title: 'forward Cross Line2', class: 'forward-cross-line2' },
    { id: 27, pattern_img: 'pattern-9_2x.png', pattern_name: 'Pattern 27', title: 'forward Cross Line2', class: 'forward-cross-line2' },
    { id: 28, pattern_img: 'pattern-10.png', pattern_name: 'Pattern 28', title: '', class: '' },
    { id: 29, pattern_img: 'pattern-10_1x.png', pattern_name: 'Pattern 29', title: '', class: '' },
    { id: 30, pattern_img: 'pattern-10_2x.png', pattern_name: 'Pattern 30', title: '', class: '' },
    { id: 31, pattern_img: 'pattern-11.png', pattern_name: 'Pattern 31', title: '', class: '' },
    { id: 32, pattern_img: 'pattern-11_1x.png', pattern_name: 'Pattern 32', title: '', class: '' },
    { id: 33, pattern_img: 'pattern-11_2x.png', pattern_name: 'Pattern 33', title: '', class: '' },
    { id: 34, pattern_img: 'pattern-12.png', pattern_name: 'Pattern 34', title: '', class: '' },
    { id: 35, pattern_img: 'pattern-12_1x.png', pattern_name: 'Pattern 35', title: '', class: '' },
    { id: 36, pattern_img: 'pattern-12_2x.png', pattern_name: 'Pattern 36', title: '', class: '' },
    { id: 37, pattern_img: 'pattern-13.png', pattern_name: 'Pattern 37', title: '', class: '' },
    { id: 38, pattern_img: 'pattern-13_1x.png', pattern_name: 'Pattern 38', title: '', class: '' },
    { id: 39, pattern_img: 'pattern-13_2x.png', pattern_name: 'Pattern 39', title: '', class: '' },
    { id: 40, pattern_img: 'pattern-14.png', pattern_name: 'Pattern 40', title: '', class: '' },
    { id: 41, pattern_img: 'pattern-14_1x.png', pattern_name: 'Pattern 41', title: '', class: '' },
    { id: 42, pattern_img: 'pattern-14_2x.png', pattern_name: 'Pattern 42', title: '', class: '' },
    { id: 43, pattern_img: 'pattern-15.png', pattern_name: 'Pattern 43', title: '', class: '' },
    { id: 44, pattern_img: 'pattern-15_1x.png', pattern_name: 'Pattern 44', title: '', class: '' },
    { id: 45, pattern_img: 'pattern-15_2x.png', pattern_name: 'Pattern 45', title: '', class: '' },
    { id: 46, pattern_img: 'pattern-16.png', pattern_name: 'Pattern 46', title: '', class: '' },
    { id: 47, pattern_img: 'pattern-16_1x.png', pattern_name: 'Pattern 47', title: '', class: '' },
    { id: 48, pattern_img: 'pattern-16_2x.png', pattern_name: 'Pattern 48', title: '', class: '' },
    { id: 49, pattern_img: 'pattern-17.png', pattern_name: 'Pattern 49', title: '', class: '' },
    { id: 50, pattern_img: 'pattern-17_1x.png', pattern_name: 'Pattern 50', title: '', class: '' },
    { id: 51, pattern_img: 'pattern-17_2x.png', pattern_name: 'Pattern 51', title: '', class: '' },
    { id: 52, pattern_img: 'pattern-18.png', pattern_name: 'Pattern 52', title: '', class: '' },
    { id: 53, pattern_img: 'pattern-18_1x.png', pattern_name: 'Pattern 53', title: '', class: '' },
    { id: 54, pattern_img: 'pattern-18_2x.png', pattern_name: 'Pattern 54', title: '', class: '' },
    { id: 55, pattern_img: 'pattern-19.png', pattern_name: 'Pattern 55', title: '', class: '' },
    { id: 56, pattern_img: 'pattern-19_1x.png', pattern_name: 'Pattern 56', title: '', class: '' },
    { id: 57, pattern_img: 'pattern-19_2x.png', pattern_name: 'Pattern 57', title: '', class: '' },
    { id: 58, pattern_img: 'pattern-20.png', pattern_name: 'Pattern 58', title: '', class: '' },
    { id: 59, pattern_img: 'pattern-20_1x.png', pattern_name: 'Pattern 59', title: '', class: '' },
    { id: 60, pattern_img: 'pattern-20_2x.png', pattern_name: 'Pattern 60', title: '', class: '' },
    { id: 61, pattern_img: 'pattern-21.png', pattern_name: 'Pattern 61', title: '', class: '' },
    { id: 62, pattern_img: 'pattern-21_1x.png', pattern_name: 'Pattern 62', title: '', class: '' },
    { id: 63, pattern_img: 'pattern-21_2x.png', pattern_name: 'Pattern 63', title: '', class: '' },
    { id: 64, pattern_img: 'pattern-22.png', pattern_name: 'Pattern 64', title: '', class: '' },
    { id: 65, pattern_img: 'pattern-22_1x.png', pattern_name: 'Pattern 65', title: '', class: '' },
    { id: 66, pattern_img: 'pattern-22_2x.png', pattern_name: 'Pattern 66', title: '', class: '' },
    { id: 67, pattern_img: 'pattern-23.png', pattern_name: 'Pattern 67', title: '', class: '' },
    { id: 68, pattern_img: 'pattern-23_1x.png', pattern_name: 'Pattern 68', title: '', class: '' },
    { id: 69, pattern_img: 'pattern-23_2x.png', pattern_name: 'Pattern 69', title: '', class: '' },
    { id: 70, pattern_img: 'pattern-24.png', pattern_name: 'Pattern 70', title: '', class: '' },
    { id: 71, pattern_img: 'pattern-24_1x.png', pattern_name: 'Pattern 71', title: '', class: '' },
    { id: 72, pattern_img: 'pattern-24_2x.png', pattern_name: 'Pattern 72', title: '', class: '' },
  ];
  setControlsVisibility = { mt: true, mb: true, ml: true, mr: true, tr: true, tl: true, br: true, bl: true};

  constructor(
    public activeModal: NgbActiveModal,
    public imgAnnotationService: ImageAnnotationService,
    public modalService: NgbModal
    // private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.fileServePath = environment.FILE_SERVER_IMAGE_URL;
    // setup front side canvas
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: false,
      selectionBorderColor: 'blue',
      // preserveObjectStacking: true,
      isDrawingMode: this.isDrawingMode

    });

    this.canvas.on({
      'object:moving': (e) => { },
      'object:modified': (e) => { },
      'object:selected': (e) => {

        const selectedObject = e.target;
        this.selected = selectedObject;
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;
        // selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';
        this.resetPanels();
        if (selectedObject.type !== 'group' && selectedObject) {
          this.getId();
          this.getOpacity();
          switch (selectedObject.type) {
            case 'rect':
              break;
            case 'ellipse':
              break;
            case 'circle':
              selectedObject.setControlsVisibility({
                mt: false,
                mb: false,
                ml: false,
                mr: false,
              });
              break;
            case 'triangle':
            case 'line':
              this.lineEditor = true;
              this.getFill();
              break;
            case 'i-text':
              this.textEditor = true;
              this.getLineHeight();
              this.getCharSpacing();
              this.getBold();
              this.getFontStyle();
              this.getFill();
              this.getTextDecoration();
              this.getTextAlign();
              this.getFontFamily();
              break;
            case 'image':
              console.log('image');
              break;
          }
        }
      },
      'selection:cleared': (e) => {
        this.selected = null;
        this.resetPanels();
      },
      'object:scaling': (e) => {
        const selectedObject = e.target;

        // this.selected = selectedObject;
        // selectedObject.hasRotatingPoint = true;
        // selectedObject.transparentCorners = false;
        // selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';
        const height = selectedObject.height * selectedObject.scaleY;
        const width = selectedObject.width * selectedObject.scaleX;
        this.resetPanels();
        if (selectedObject.type !== 'group' && selectedObject) {
          this.getId();
          this.getOpacity();
          switch (selectedObject.type) {
            case 'rect':
              selectedObject.width = width;
              selectedObject.height = height;
              selectedObject.scaleX = 1;
              selectedObject.scaleY = 1;

              break;
            case 'circle':
              selectedObject.radius = height / 2;
              selectedObject.width = width;
              selectedObject.height = height;
              selectedObject.scaleX = 1;
              selectedObject.scaleY = 1;

              break;
            case 'ellipse':
              selectedObject.rx = width / 2;
              selectedObject.ry = height / 2;
              selectedObject.width = width;
              selectedObject.height = height;
              selectedObject.scaleX = 1;
              selectedObject.scaleY = 1;
              break;
          }
        }
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // get references to the html canvas element & its context
    // this.canvas.on('mouse:down', (o) => {
    //   const tempPointer = this.canvas.getPointer(o.e);
    //   this.pointer = tempPointer;
    //   this.drawElipse();
    // // let canvasElement: any = document.getElementById('canvas');
    // // console.log(canvasElement)
    // });

    // this.canvas.observe('mouse:down', (e) => { this.mousedown(e); });
    // this.canvas.observe('mouse:move', (e) => { this.mousemove(e); });
    // this.canvas.observe('mouse:up', (e) => { this.mouseup(e); });
    if (this.imagePath) {
      this.getImgFromList();
    }
  }

  /* Mousedown */
  mousedown(o) {
    const mouse = this.canvas.getPointer(o.e);
    this.isDown = true;
    this.x = mouse.x;
    this.y = mouse.y;

    const square = new fabric.Rect({
      width: 0,
      height: 0,
      left: this.x,
      top: this.y,
      fill: '#000'
    });

    this.canvas.add(square);
    this.canvas.renderAll();
    this.canvas.setActiveObject(square);

  }


  /* Mousemove */
  mousemove(o) {
    if (!this.isDown) {
      return false;
    }

    const mouse = this.canvas.getPointer(o.e);

    const w = Math.abs(mouse.x - this.x);
    const h = Math.abs(mouse.y - this.y);

    if (!w || !h) {
      return false;
    }

    const square = this.canvas.getActiveObject();
    square.set('width', w).set('height', h);
    this.canvas.renderAll();
  }

  /* Mouseup */
  mouseup(e) {
    this.isDown = false;
    const square = this.canvas.getActiveObject();
    this.canvas.add(square);
    // this.canvas.renderAll();
    // square.setCoords();  //allows object to be selectable and moveable
  }


  /*------------------------Block elements------------------------*/

  // Block "Size"

  changeSize(event: any) {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }

  // Block "Add text"

  addText() {
    this.deselectDrawingMode();
    const textString = this.textString;
    const text = new fabric.IText(textString, {
      left: 10,
      top: 10,
      fontFamily: 'helvetica',
      angle: 0,
      fill: '#000000',
      scaleX: 0.5,
      scaleY: 0.5,
      fontWeight: '',
      hasRotatingPoint: true
    });
    this.extend(text, this.randomId());
    this.canvas.add(text);
    this.selectItemAfterAdded(text);
    this.textString = '';
  }

  // Block "Add images"

  // getImgPolaroid(event: any) {
  //   this.deselectDrawingMode();
  //   this.canvas.clear();
  //   const el = event.target;
  //   fabric.Image.fromURL(el.src, (image) => {
  //     image.set({
  //       left: 10,
  //       top: 10,
  //       angle: 0,
  //       padding: 10,
  //       cornersize: 10,
  //       hasRotatingPoint: false,
  //       peloas: 12,
  //       selectable: false
  //     });
  //     // image.width = 100;
  //     // image.height = 100;
  //     image.width = this.size.width;
  //     image.height = this.size.height;
  //     this.extend(image, this.randomId());
  //     this.canvas.add(image);
  //     // this.selectItemAfterAdded(image);
  //     // this.canvas.item(0).selectable = false;
  //   });
  // }

  getImgFromList() {
    this.deselectDrawingMode();
    this.canvas.clear();
    let filePath = '';
    // if (event && event.target) {
    //   filePath = event.target.src;
    // } else {
    filePath = this.imagePath;
    // }
    if (filePath) {
      fabric.Image.fromURL(filePath, (image) => {
        image.set({
          left: 10,
          top: 10,
          angle: 0,
          padding: 10,
          cornersize: 10,
          hasRotatingPoint: false,
          peloas: 12,
          selectable: false,
        });
        const elWidth = image.width;
        const elHeight = image.height;
        const scaleX = image.scaleX  * this.canvas.getWidth() / elWidth;
        const scaleY = image.scaleY  * this.canvas.getHeight() / elHeight;
        image.width = elWidth;
        image.height = elHeight;
        image.scaleX = scaleX;
        image.scaleY = scaleY;
        // image.width = this.canvas.getWidth(),
        // image.height = this.canvas.getHeight(),
        // image.scaleToWidth(500);
        // image.scaleToHeight(800);
        this.extend(image, this.randomId());
        this.canvas.add(image);

        // this.selectItemAfterAdded(image);
        // this.canvas.item(0).selectable = false;
      });
    }
  }

  // Block "Upload Image"

  addImageOnCanvas(url?) {
    // this.deselectDrawingMode();
    // if (url) {
    //   fabric.Image.fromURL(url, (image) => {
    //     image.set({
    //       left: 10,
    //       top: 10,
    //       angle: 0,
    //       padding: 10,
    //       cornersize: 10,
    //       hasRotatingPoint: true
    //     });
    //     image.setWidth(this.size.width);
    //     image.setHeight(this.size.height);
    //     this.extend(image, this.randomId());
    //     this.canvas.add(image);
    //     this.selectItemAfterAdded(image);
    //   });
    // }
  }

  readUrl(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.url = event.target['result'];
        this.addImageOnCanvas(this.url);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  removeWhite(url) {
    this.url = '';
  }

  // Block "Add figure"

  addFigure(figure) {

    this.deselectDrawingMode();

    let add: any;
    switch (figure) {
      case 'line':
        add = new fabric.Line([50, 100, 200, 200], {
          left: 170,
          top: 150,
          stroke: this.props.fill,
          strokeWidth: this.props.strokeWidth,
        });
        break;
      case 'rectangle':
        add = new fabric.Rect({
          width: 200, height: 100, left: 10, top: 10, angle: 0, stroke: this.props.fill,
          strokeWidth: this.props.strokeWidth, objectCaching: false,
          fill: 'rgba(0,0,0,0)'
        });
        break;
      case 'square':
        add = new fabric.Rect({
          width: 100, height: 100, left: 10, top: 10, angle: 0,
          fill: '#4caf50'
        });
        break;
      case 'triangle':
        add = new fabric.Triangle({
          width: 100, height: 100, left: 10, top: 10, fill: '#2196f3'
        });
        break;
      case 'circle':
        add = new fabric.Circle({
          stroke: this.props.fill,
          strokeWidth: this.props.strokeWidth,
          radius: 50, left: 10, top: 10, fill: 'rgba(0,0,0,0)', angle: 0, objectCaching: false
        });
        break;
      case 'ellipse':
        add = new fabric.Ellipse({
          left: 150,
          top: 150,
          rx: 100,
          ry: 50,
          width: 100,
          stroke: this.props.fill,
          strokeWidth: this.props.strokeWidth,
          height: 60, fill: 'rgba(0,0,0,0)', objectCaching: false
        });
        break;
    }


    this.extend(add, this.randomId());
    this.canvas.add(add);
    this.selectItemAfterAdded(add);
    this.bringToFront();

  }

  /*Canvas*/

  cleanSelect() {
    this.canvas().renderAll();
  }

  selectItemAfterAdded(obj) {
    this.canvas.renderAll();
    this.canvas.setActiveObject(obj);
  }

  setCanvasFill() {
    if (!this.props.canvasImage) {
      this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.renderAll();
    }
  }

  extend(obj, id) {
    obj.toObject = ((toObject) => {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id
        });
      };
    })(obj.toObject);
  }

  setCanvasImage() {
    const self = this;
    if (this.props.canvasImage) {
      this.canvas.setBackgroundColor({ source: this.props.canvasImage, repeat: 'repeat' }, () => {
        // self.props.canvasFill = '';
        self.canvas.renderAll();
      });
    }
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  /*------------------------Global actions for element------------------------*/

  getActiveStyle(styleName, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) { return ''; }

    return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
  }


  setActiveStyle(styleName, value, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) { return; }

    if (object.setSelectionStyles && object.isEditing) {
      const style = {};
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    } else {
      object.set(styleName, value);
    }

    object.setCoords();
    this.canvas.renderAll();
  }


  getActiveProp(name) {
    const object = this.canvas.getActiveObject();
    if (!object) { return ''; }

    return object[name] || '';
  }

  setActiveProp(name, value) {
    const object = this.canvas.getActiveObject();
    if (!object) { return; }
    object.set(name, value).setCoords();
    this.canvas.renderAll();
  }


  getId() {
    this.props.id = this.canvas.getActiveObject().toObject().id;
  }

  setId() {
    const val = this.props.id;
    const complete = this.canvas.getActiveObject().toObject();
    // console.log(complete);
    this.canvas.getActiveObject().toObject = () => {
      complete.id = val;
      return complete;
    };
  }

  getOpacity() {
    this.props.opacity = this.getActiveStyle('opacity', null) * 100;
  }

  setOpacity() {
    this.setActiveStyle('opacity', parseInt(this.props.opacity) / 100, null);
  }

  getFill() {
    this.props.fill = this.getActiveStyle('fill', null);
  }

  setFill() {
    const type = this.selected ? this.selected.type : null;
    if (type) {
      if (type === 'line' || type === 'rect' || type === 'circle' || type === 'ellipse') {
        this.setActiveStyle('stroke', this.props.fill, null);
        this.setActiveStyle('strokeWidth', this.props.strokeWidth, null);
      } else if (type === 'path') {
        this.selectDrawingMode();
      } else {
        this.setActiveStyle('fill', this.props.fill, null);
      }
    } else {
      this.selectDrawingMode();
    }
  }

  getLineHeight() {
    this.props.lineHeight = this.getActiveStyle('lineHeight', null);
  }

  setLineHeight() {
    this.setActiveStyle('lineHeight', parseFloat(this.props.lineHeight), null);
  }


  getCharSpacing() {
    this.props.charSpacing = this.getActiveStyle('charSpacing', null);
  }

  setCharSpacing() {
    this.setActiveStyle('charSpacing', this.props.charSpacing, null);
  }

  getFontSize() {
    this.props.fontSize = this.getActiveStyle('fontSize', null);
  }

  setFontSize() {
    this.setActiveStyle('fontSize', parseInt(this.props.fontSize), null);
  }

  getBold() {
    this.props.fontWeight = this.getActiveStyle('fontWeight', null);
  }

  setBold() {
    this.props.fontWeight = !this.props.fontWeight;
    this.setActiveStyle('fontWeight', this.props.fontWeight ? 'bold' : '', null);
  }

  getFontStyle() {
    this.props.fontStyle = this.getActiveStyle('fontStyle', null);
  }

  setFontStyle() {
    this.props.fontStyle = !this.props.fontStyle;
    this.setActiveStyle('fontStyle', this.props.fontStyle ? 'italic' : '', null);
  }


  getTextDecoration() {
    this.props.TextDecoration = this.getActiveStyle('textDecoration', null);
  }

  setTextDecoration(value) {
    let iclass = this.props.TextDecoration;
    if (iclass.includes(value)) {
      iclass = iclass.replace(RegExp(value, 'g'), '');
    } else {
      iclass += ` ${value}`;
    }
    this.props.TextDecoration = iclass;
    this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
  }

  hasTextDecoration(value) {
    return this.props.TextDecoration.includes(value);
  }


  getTextAlign() {
    this.props.textAlign = this.getActiveProp('textAlign');
  }

  setTextAlign(value) {
    this.props.textAlign = value;
    this.setActiveProp('textAlign', this.props.textAlign);
  }

  getFontFamily() {
    this.props.fontFamily = this.getActiveProp('fontFamily');
  }

  setFontFamily() {
    this.setActiveProp('fontFamily', this.props.fontFamily);
  }

  /*System*/


  removeSelected() {
    const activeObject = this.canvas.getActiveObject();
    // const activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      this.canvas.remove(activeObject);
      // this.textString = '';
    }
    // else if (activeGroup) {
    //   const objectsInGroup = activeGroup.getObjects();
    //   this.canvas.discardActiveGroup();
    //   const self = this;
    //   objectsInGroup.forEach((object) => {
    //     self.canvas.remove(object);
    //   });
    // }
  }

  bringToFront() {
    const activeObject = this.canvas.getActiveObject();
    // const activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      activeObject.bringToFront();
      // activeObject.opacity = 1;
    }
    // else if (activeGroup) {
    //   const objectsInGroup = activeGroup.getObjects();
    //   this.canvas.discardActiveGroup();
    //   objectsInGroup.forEach((object) => {
    //     object.bringToFront();
    //   });
    // }
  }

  sendToBack() {
    const activeObject = this.canvas.getActiveObject();
   // const activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      activeObject.sendToBack();
      // activeObject.opacity = 1;
    }
    // else if (activeGroup) {
    //   const objectsInGroup = activeGroup.getObjects();
    //   this.canvas.discardActiveGroup();
    //   objectsInGroup.forEach((object) => {
    //     object.sendToBack();
    //   });
    // }
  }

  // confirmClear() {
  //   if (confirm('Are you sure?')) {
  //     // this.canvas.clear();
  //   }

  //   this.canvas.discardActiveObject();
  //   const sel = new fabric.ActiveSelection(this.canvas.getObjects(), {
  //     canvas: this.canvas,
  //   });
  //   this.canvas.setActiveObject(sel);
  //   this.removeSelected();
  //   this.canvas.requestRenderAll();
  // }

  // clearAllConfirmationPopup() {
  //   const modalTitleobj = 'Clear All';
  //   const modalBodyobj = 'Do you want to clear all?';
  //   const messageDetails = {
  //     modalTitle: modalTitleobj,
  //     modalBody: modalBodyobj
  //   };
  //   const modalInstance = this.modalService.open(ConfirmationPopupComponent,
  //     {
  //       ariaLabelledBy: 'modal-basic-title',
  //       backdrop: 'static',
  //       keyboard: false
  //     });
  //   modalInstance.result.then((result) => {
  //     if (result === 'Ok') {
  //       this.confirmClear();
  //     }
  //   });
  //   modalInstance.componentInstance.messageDetails = messageDetails;
  // }

  rasterize() {
    if (!fabric.Canvas.supports('toDataURL')) {
      alert('This browser doesn\'t provide means to serialize canvas to an image');
    } else {
      // console.log(this.canvas.toDataURL('png'));
      // window.open(this.canvas.toDataURL('png'));
      const image = new Image();
      image.src = this.canvas.toDataURL('png');
      const w = window.open('');
      w.document.write(image.outerHTML);
    }
  }

  rasterizeSVG() {
    console.log(this.canvas.toSVG());
    // window.open(
    //   'data:image/svg+xml;utf8,' +
    //   encodeURIComponent(this.canvas.toSVG()));
    // console.log(this.canvas.toSVG())
    // var image = new Image();
    // image.src = this.canvas.toSVG()
    const w = window.open('');
    w.document.write(this.canvas.toSVG());
  }


  saveCanvasToJSON() {
    const json = JSON.stringify(this.canvas);
    localStorage.setItem('Kanvas', json);
    // console.log('json');
    // console.log(json);

  }

  loadCanvasFromJSON() {
    const CANVAS = localStorage.getItem('Kanvas');
    // console.log('CANVAS');
    // console.log(CANVAS);

    // and load everything from the same json
    this.canvas.loadFromJSON(CANVAS, () => {
      // console.log('CANVAS untar');
      // console.log(CANVAS);

      // making sure to render canvas at the end
      this.canvas.renderAll();

      // and checking if object's "name" is preserved
      // console.log('this.canvas.item(0).name');
      // console.log(this.canvas);
    });

  }

  rasterizeJSON() {
    this.json = JSON.stringify(this.canvas, null, 2);
  }

  resetPanels() {
    this.textEditor = false;
    this.imageEditor = false;
    this.figureEditor = false;
    this.lineEditor = false;
    // this.deselectDrawingMode();
  }

  selectDrawingMode() {
    // this.isDrawingMode = true;
    this.canvas.isDrawingMode = this.isDrawingMode;
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.color = this.props.fill ? this.props.fill : '#000000';
    this.canvas.freeDrawingBrush.width = this.props.strokeWidth;
    this.canvas.renderAll();
    // this.textString = '';
  }

  deselectDrawingMode() {
    this.isDrawingMode = false;
    this.canvas.isDrawingMode = this.isDrawingMode;
  }

  toggleDrawingMode() {
    this.isDrawingMode = !this.isDrawingMode;
    this.canvas.isDrawingMode = this.isDrawingMode;
  }

  undoAction() {
    if (this.canvas._objects.length > 0) {
      this.undo.push(this.canvas._objects.pop());
      this.canvas.renderAll();
    }
  }

  redoAction() {
    if (this.undo.length > 0) {
      this.isRedoing = true;
      this.canvas.add(this.undo.pop());
    }
  }

  saveImg() {
    const data = this.canvas.toDataURL({
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight(),
      multiplier: 2
    });
    const tempObj = {
      masterDocId: 0,
      fileName: this.imageName,
      fileData: data,
      fileTitle: this.annotationDetail
    };
    this.imgAnnotationService.uploadBase64File(tempObj).subscribe(res => {
      if (res) {
        res['chart_detail_id'] = this.chartDetailId;
        const tempResponse = {
          isSave: true,
          data: res
        };
        // console.log(res);
        this.activeModal.close(tempResponse);
      }
    });
  }

  fillPattern(ptrn) {
    this.selectedPattern = ptrn;
    const padding = 0;
    const object = this.canvas.getActiveObject();
    if (this.selectedPattern !== 'pattern-0.png') {
      const patternPath = './assets/images/annotation-patterns/' + this.selectedPattern;
      fabric.Image.fromURL(patternPath, (img) => {
        // img.scaleToWidth(5);
        const patternSourceCanvas = new fabric.StaticCanvas();
        patternSourceCanvas.add(img);
        patternSourceCanvas.renderAll();
        const pattern = new fabric.Pattern({
          source: (o) => {
            patternSourceCanvas.setDimensions({
              width: img.width + padding,
              height: img.height + padding
            });
            patternSourceCanvas.renderAll();
            return patternSourceCanvas.getElement();
          },
          repeat: 'repeat'
        });
        // this.addFigure('rectangle');
        if (this.selected && this.selected.type !== 'path' && this.selected.type !== 'line' && this.selected.type !== 'i-text') {
          this.setActiveStyle('fill', pattern, null);
        }
      });
    } else {
      if (this.selected && this.selected.type !== 'path' && this.selected.type !== 'line' && this.selected.type !== 'i-text') {
        this.setActiveStyle('fill', '#ffffff00', null);
      }
    }
  }
  // uploadFile() {
  //   const files = this.uploadFiles;
  //   console.log(files);
  //   const fileToUpload = files[0];
  //   const formData: any = new FormData();
  //   formData.append('files', fileToUpload, fileToUpload.name);
  //   this.imgAnnotationService.uploadImageForAnnotation(formData).subscribe(event => {
  //     console.log(files);
  //   });
  // }

  getBase64ImageFile(masterDocId): Observable <any> {
    return this.imgAnnotationService.getBase64FileByMasterDocId(masterDocId).pipe(map((res: any) => {
      return res;
    }));
  }

  selectImageForAnnotation(selectedImage) {
    this.getBase64ImageFile(selectedImage.master_doc_id).subscribe(res => {
      this.imagePath = res.file_data;
      this.imageName = res.file_name;
      this.getImgFromList();
    });
  }

}
