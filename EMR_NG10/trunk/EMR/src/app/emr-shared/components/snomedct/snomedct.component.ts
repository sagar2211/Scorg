import {
  AfterViewInit,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import Tribute, {TributeOptions} from 'tributejs';
import {NgxTributeDirective} from 'ngx-tribute';
import {CommonService} from '../../../public/services/common.service';
declare const google: any;
import * as _ from 'lodash';
interface TributeValue {
  key: string;
  value: string;
}

@Component({
  selector: 'app-snomedct',
  templateUrl: './snomedct.component.html',
  styleUrls: ['./snomedct.component.scss']
})
export class SnomedctComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('tributeDirective', {static: true}) tributeDirectiveInComponent: NgxTributeDirective<TributeValue>;
  @ViewChild('snoMed', {static: true}) snoMed: ElementRef;
  options: TributeOptions<TributeValue>;
  showInput = true; // On showInput = false, the tribute container gets cleaned up.
  formControlValue = '';
  collectionArray = [];
  termsArray: any;
  inputModelContentNew: any;
  snomedSearchKeywords = '';
  activeCaretPosition: any;
  activeLeftPosition: any;
  activeRightPosition: any;
  detached = false;
  triggerSymbol = '@';
  @Input() placeHolderName = '';
  @Input() idName = 'snoMedId';
  @Input() snowMedUsedKeyWordsArray: TributeValue[] = [];
  @Input()
  set  inputModelContent(inputModelContent: string) {
      this.inputModelContentNew = inputModelContent || '';
   }
  get inputModelContent(): string {return this.inputModelContentNew; }
  @Input() selectedLanguage: any;
  @Input() parentTextChanged: boolean;
  @Output() receivedAction = new EventEmitter<any>();
  googleTransControl: any;
  isTranslationEnabled = true;
  transIds = ['translateAdvice1'];
  loaded = false;
  isTextSelected = false;
  tributeElement: Tribute<any>;
  prevText = '';
  isTriggered = false;
  testActive = 0;
  searchString = '';
  @Input() textAreaSize = 'small'; // values: 'small' 'large'
  @Input() semanticTags: any;
  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private commonService: CommonService) {
  }
  ngOnInit() {
    this.inputModelContentNew = this.inputModelContentNew.replace(/&nbsp;/g, '');
    this.snoMed.nativeElement.innerHTML = this.inputModelContentNew;
    this.loaded = true;
    const load = (text, cb) => {
      // if (!_.isEmpty(this.tributeDirectiveInComponent.tribute['current'])) {
      //   this.tributeDirectiveInComponent.tribute['current']['mentionText'] = 'Patient' + text;
      // }
      text = (this.snomedSearchKeywords !== '') ? this.snomedSearchKeywords : text;
      this.getSnowedCTSuggestions(cb,  text);
    };
    this.options = {
      trigger: this.triggerSymbol,
      lookup: 'value',
      allowSpaces: true,
      autocompleteMode: false,
      requireLeadingSpace: false,
      menuShowMinLength: 2,
      // noMatchTemplate: () => {
      //   console.log('collection array:', this.collectionArray);
      //   return null;
      // },
      replaceTextSuffix: ' ',
      // values: (text, cb) => {
      //   if (!_.isEmpty(this.tributeDirectiveInComponent.tribute['current'])) {
      //     this.tributeDirectiveInComponent.tribute['current']['mentionText'] = 'Patient' + text;
      //   }
      //   text = (this.snomedSearchKeywords !== '') ? this.snomedSearchKeywords : text;
      //   this.getSnowedCTSuggestions(cb,  text);
      // },
      // values: (text, cb) => {
      //   // if (!_.isEmpty(this.tributeDirectiveInComponent.tribute['current'])) {
      //   //   this.tributeDirectiveInComponent.tribute['current']['mentionText'] = 'Patient' + text;
      //   // }
      //   text = (this.snomedSearchKeywords !== '') ? this.snomedSearchKeywords : text;
      //   this.getSnowedCTSuggestions(cb,  text);
      // },
      values: _.debounce(load.bind(this), 800),
      selectTemplate: (item) => {
        return this.setSnomedCTKeywordTemplate(item.original);
      },
    };
  }

  // loadData (this, text, cb) {
  //   this.getSnowedCTSuggestions(text,  cb);
  //   console.log(val);
  // }
  ngAfterViewInit() {
    this.snoMed.nativeElement.setAttribute('placeholder', this.placeHolderName);
    // this.tributeDirectiveInComponent.tribute['hasTrailingSpace'] = true;
    document.getElementById(this.idName).addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.keyCode === 32) {
          this.snomedSearchKeywords = '';
          this.tributeDirectiveInComponent.tribute['collection'][0].trigger = this.triggerSymbol;
          if (window.getSelection().toString() !== '') {
            this.manageSuggestions();
          } else {
            const caret = this.getCaretPosition(document.getElementById(this.idName));
            // console.log('caret:', caret);
            if (this.snoMed.nativeElement.innerHTML.charAt(caret - 1) !== ' ') {
              // console.log('word:', word);
              this.snapSelectionToWord();
              this.manageSuggestions();
            } else {
              this.tributeDirectiveInComponent.tribute.showMenuForCollection(document.getElementById(this.idName));
            }
          }
        } else if (e.keyCode === 32) {
          // this.tributeDirectiveInComponent.tribute['collection'][0].trigger = '@';
          // this.snapSelectionToWord();
          // this.searchString = (this.searchString === '') ? window.getSelection().toString() :  this.searchString + ' ' + window.getSelection().toString();
          // this.manageSuggestions();
        }
        this.checkIfRemoved(e);
      }, true);
    document
      .getElementById(this.idName)
      .addEventListener('tribute-no-match', (e) => {
        let testinput = document.getElementById(this.idName);
        this.tributeDirectiveInComponent.tribute['showMenuFor'](testinput);
        setTimeout(() => {
          if (!this.collectionArray.length) {
            // console.log('innerhtml before', this.snoMed.nativeElement.innerHTML );
            this.snoMed.nativeElement.innerHTML = this.snoMed.nativeElement.innerHTML.replace(/@/g, '');
            // console.log('innerhtml after', this.snoMed.nativeElement.innerHTML );
            this.snoMed.nativeElement.blur();
          }
          }, 2000);
      });
    document
      .getElementById(this.idName)
      .addEventListener('tribute-active-false', (e) => {
        if (!_.isUndefined(this.tributeDirectiveInComponent.tribute['current']) && !_.isEmpty(this.tributeDirectiveInComponent.tribute['current'])) {
          if (!_.isUndefined(this.tributeDirectiveInComponent.tribute['current'].filteredItems)) {
            if (this.tributeDirectiveInComponent.tribute['current'].filteredItems.length > 0) {
              // console.log('innerhtml before', this.snoMed.nativeElement.innerHTML );
              this.snoMed.nativeElement.innerHTML = this.snoMed.nativeElement.innerHTML.replace(/@/g, '');
              // console.log('innerhtml after', this.snoMed.nativeElement.innerHTML );
              this.snoMed.nativeElement.blur();
            }
          }
        }
      });
  }

  manageSuggestions() {
    // console.log('selection string:', window.getSelection().toString());
    if (window.getSelection().toString() === '') {
      this.snomedSearchKeywords = '';
      this.tributeDirectiveInComponent.tribute.showMenuForCollection(document.getElementById(this.idName));
    } else {
      const selection = window.getSelection();
      const start = selection.anchorOffset;
      const end = selection.focusOffset;
      this.snomedSearchKeywords = window.getSelection().toString();
      // this.tributeDirectiveInComponent.tribute['replaceTextSuffix'] = this.snomedSearchKeywords;
      this.tributeDirectiveInComponent.tribute['collection'][0].trigger = this.snomedSearchKeywords;
      this.isTriggered = false;
      this.tributeDirectiveInComponent.tribute.showMenuForCollection(document.getElementById(this.idName));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.loaded  && changes.selectedLanguage) {
      this.initTransliterationAPI();
    }
    // code by himanshu
    if (this.parentTextChanged) {
      setTimeout(() => {
        this.snoMed.nativeElement.innerHTML = this.inputModelContentNew;
        this.searchString = '';
      }, 500);
    }
    // if (changes.parentTextChanged) {
    //   if (this.parentTextChanged) {
    //     setTimeout(() => {
    //       this.snoMed.nativeElement.innerHTML = this.inputModelContentNew;
    //       this.searchString = '';
    //     }, 500);
    //   }
    // }
    if (changes.semanticTags) {
      if (this.semanticTags) {
        this.semanticTags = (this.semanticTags === undefined || this.semanticTags === '' || this.semanticTags === null) ? [] :
          (_.isArray(this.semanticTags)) ? this.semanticTags : JSON.parse(this.semanticTags);
      }
    }

  }

  formatTerms(cb) {
    const collectionArr = [];
    _.forEach(this.termsArray.items, (o) => {
      const collectionObj = {
        key: o.concept.conceptId,
        value: o.term
      };
      collectionArr.push(collectionObj);
    });
    this.collectionArray = collectionArr;
    cb(this.collectionArray);
    // if (this.tributeDirectiveInComponent.tribute['current'] !== undefined && !_.isEmpty(this.tributeDirectiveInComponent.tribute['current'])) {
    //   if (this.tributeDirectiveInComponent.tribute['current']['filteredItems']) !== undefined {
    //   }
      // this.tributeDirectiveInComponent.tribute['current']['filteredItems'] = this.collectionArray;
    // }
    // this.tributeDirectiveInComponent.tribute.appendCurrent(this.collectionArray);
  }

  getSnowedCTSuggestions(cb, text?) {
    if (cb === undefined) {
      return;
    }
    if (text.length < 2) {return; }
    this.commonService.getSnowedCTData(text, this.semanticTags).subscribe(res => {
      if (res) {
        this.termsArray = res;
        if (this.termsArray.items === undefined || this.termsArray.items.length === 0 || !this.termsArray.items) {
          this.prevText = '';
        }
        this.formatTerms(cb);
      } else {
        this.prevText = '';
      }
    });
  }

  emitChanges(action, $event?) {
    const emitData = {action, data: ($event !== undefined) ? $event : null};
    if (action === 'model_changes') {
      const newStr = $event.target.innerHTML.replace(/&nbsp;/g, '');
      emitData.data = newStr;
    }
    this.receivedAction.emit(emitData);
  }

  // -- call the google transliteration function
  initTransliterationAPI() {
    if (!this.googleTransControl) {
      this.initTransliteration();
    }
    if (this.googleTransControl.isTransliterationEnabled() && this.selectedLanguage.id === '1') {
      this.googleTransControl.toggleTransliteration();
    } else if (!this.googleTransControl.isTransliterationEnabled() && this.selectedLanguage.id != '1') {
      this.googleTransControl.toggleTransliteration();
    }
  }

  initTransliteration() {
    const options = {
      sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
      destinationLanguage: [google.elements.transliteration.LanguageCode.MARATHI, google.elements.transliteration.LanguageCode.HINDI],
      transliterationEnabled: true
    };
    if (this.selectedLanguage.id === '2') {
      options.destinationLanguage = [google.elements.transliteration.LanguageCode.HINDI];
    } else if (this.selectedLanguage.id === '3') {
      options.destinationLanguage = [google.elements.transliteration.LanguageCode.MARATHI];
    } else if (this.selectedLanguage.id === '1') {
      options.transliterationEnabled = false;
    }

    this.googleTransControl = new google.elements.transliteration.TransliterationControl(options);
    this.googleTransControl.addEventListener(google.elements.transliteration.TransliterationControl.EventType.STATE_CHANGED,
      this.transliterateStateChangeHandler);
    setTimeout(() => {
      this.googleTransControl.makeTransliteratable(this.transIds);
    }, 500);
  }

  transliterateStateChangeHandler(e) {
    this.isTranslationEnabled = e.transliterationEnabled;
  }

  itemSelected($event) {
    if (this.searchString.split(' ').length > 1) {
      const newSpan = this.setSnomedCTKeywordTemplate($event);
      this.replacer(newSpan, $event.key);
      this.replacer(this.searchString, '');
      this.replacer($event.key, newSpan);
      this.snoMed.nativeElement.innerHTML = this.snoMed.nativeElement.innerHTML.replace(newSpan, $event.key);
    }
    this.searchString = '';
    this.emitChanges('snomed_item_selected', $event);
  }

  checkIfRemoved(event) {
    if (event) {
      if (event.key === 'Backspace') {
        // item removed by back space. Loop through all snowmed keys to check if any key removed. If removed, splice from snowmed key array.
        setTimeout(() => {
          _.forEach(this.snowMedUsedKeyWordsArray, (o, k) => {
            const searchText = this.setSnomedCTKeywordTemplate(o);
            if (searchText !== '') {
              if (this.snoMed.nativeElement.innerHTML.indexOf(searchText) === -1) {
                this.emitChanges('snomed_item_removed', o);
                this.snowMedUsedKeyWordsArray.splice(k, 1);
              }
            }
          });
        }, 500);
      }
    }
  }

  setSnomedCTKeywordTemplate(item): string {
    if (item === undefined || item === null || !item) {
      return '';
    }
    const htmlText = '<span contenteditable="false" class="key_' + item.key + '"><b>' + item.value + ' </b> </span> ';
    return htmlText;
  }

  snapSelectionToWord() {
    let sel;

    // Check for existence of window.getSelection() and that it has a
    // modify() method. IE 9 has both selection APIs but no modify() method.
    if (window.getSelection && (sel = window.getSelection())['modify']) {
      sel = window.getSelection();
      if (sel.isCollapsed) {

        // Detect if selection is backwards
        let range = document.createRange();
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);
        let backwards = range.collapsed;
        range.detach();

        // modify() works on the focus of the selection
        let endNode = sel.focusNode, endOffset = sel.focusOffset;
        sel.collapse(sel.anchorNode, sel.anchorOffset);

        let direction = [];
        if (backwards) {
          direction = ['backward', 'forward'];
        } else {
          direction = ['forward', 'backward'];
        }

        sel['modify']('move', direction[0], 'character');
        sel['modify']('move', direction[1], 'word');
        sel.extend(endNode, endOffset);
        sel['modify']('extend', direction[1], 'character');
        sel['modify']('extend', direction[0], 'word');
      }
    } else if ( (sel = document['selection']) && sel.type !== 'Control') {
      let textRange = sel.createRange();
      if (textRange.text) {
        textRange.expand('word');
        // Move the end back to not include the word's trailing space(s),
        // if necessary
        while (/\s$/.test(textRange.text)) {
          textRange.moveEnd('character', -1);
        }
        textRange.select();
      }
    }
  }

  replacer(search, replace) {
    // console.log('in replaceer');
    const sel = window.getSelection();
    if (!sel.focusNode) {
      return;
    }

    let startIndex = sel.focusNode.nodeValue.indexOf(search);
    let endIndex = startIndex + search.length;
    if (startIndex === -1) {
      return;
    }
    // console.log('first focus node: ', sel.focusNode.nodeValue);
    let range = document.createRange();
    // Set the range to contain search text
    range.setStart(sel.focusNode, startIndex);
    range.setEnd(sel.focusNode, endIndex);
    // Delete search text
    range.deleteContents();
    // console.log('focus node after delete: ', sel.focusNode.nodeValue);
    // Insert replace text
    range.insertNode(document.createTextNode(replace));
    // console.log('focus node after insert: ', sel.focusNode.nodeValue);
    // Move the caret to end of replace text
    sel.collapse(sel.focusNode, 0);
  }

  getCaretPosition(element) {
    let range = window.getSelection().getRangeAt(0);
    let preCaretRange = range.cloneRange();
    let caretPosition;
    const tmp = document.createElement('div');

    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    tmp.appendChild(preCaretRange.cloneContents());
    caretPosition = tmp.innerHTML.length;
    this.activeCaretPosition = caretPosition;
    return caretPosition;
  }

  getWordAt(str, pos) {

    // // Perform type conversions.
    // str = String(str);
    // pos = Number(pos) >>> 0;
    //
    // // Search for the word's beginning and end.
    // const left = str.slice(0, pos + 1).search(/\S+$/);
    // const right = str.slice(pos).search(/\s/);
    //
    // this.activeLeftPosition = left;
    // this.activeRightPosition = right;
    // // The last word in the string is a special case.
    // if (right < 0) {
    //   return str.slice(left);
    // }
    // // Return the word, using the located bounds to extract it from the string.
    // return str.slice(left, right + pos);
    const result = /\S+$/.exec(str.slice(0, str.indexOf(' ', pos)));
    // const result = /\S+$/.exec(str.slice(0, pos));
    if (!result || result === undefined || result === null) {
      this.activeLeftPosition = 0;
      this.activeRightPosition = 0;
      return '';
    }
    if (result[0] === undefined) {
      this.activeLeftPosition = 0;
      this.activeLeftPosition = 0;
      return '';
    }
    if (str.charAt(result.index + result[0].length) !== '') {
      result[0] = result[0] + str.charAt(result.index + result[0].length);
    }
    const lastIndex = result.index + (result[0].length - 1);
    this.activeLeftPosition = result.index;
    this.activeRightPosition = (str.length <= result.index + (result[0].length)) ?  str.length : lastIndex;
    // console.log('left- ', this.activeLeftPosition);
    // console.log('right- ', this.activeRightPosition);
    // get word without html
    // result[0] = result[0].replace(/&nbsp;/g, '');
    if ((result[0].indexOf('</span>') !== -1 || result[0].indexOf('<span>') !== -1 || result[0].indexOf('&nbsp;'))) {
      return '';
    }
    if (result[0] === '') {
      this.activeLeftPosition = 0;
      this.activeLeftPosition = 0;
      return '';
    }
    return result[0];
  }

}
