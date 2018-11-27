import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { AllModulesService } from '../../services/modules.service';
import { UtterRules, HotfixItem, Annotation, SlotAction, Rules, Hotfix, ErrorMessage } from '../../models/objects';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';

@Component({
    selector: 'query-comp',
    templateUrl: 'query.component.html',
    styleUrls: ['../utterance/utterance.component.css']
})

export class QueryComponent {
    intent: string;
    text: string;
    convertedText: string;

    setences: Annotation;
    @Input() utterRule: UtterRules;
    @Input() type: string;
    @Input() isnew: boolean;
    @Input() readOnly: boolean;

    currentEditindex: number;
    domain: string;
    inputDisable: boolean;
    words: Array<string>;
    wordsSloted: Array<number>;
    mouseD: boolean;
    mouseU: boolean;
    offsetxfrom: number;
    offsetxto: number;
    display: string;
    left: string;
    top: string;
    wordsIndex: Array<number>;
    //currentEditindex: number;
    editIndex: number;
    domainID: string;
    strSlot: string;
    newSlot: SlotAction;
    myElement: ElementRef;

    constructor(private router: ActivatedRoute, private myrouter: Router, private _location: Location, private allModulesService: AllModulesService, element: ElementRef) {
        this.domainID = this.router.snapshot.params['id'];
        this.intent = "";
        this.inputDisable = false;
        this.text = "";
        this.convertedText = "";

        this.words = [];
        this.wordsSloted = [];
        this.mouseD = false;
        this.mouseU = true;
        this.offsetxfrom = -1;
        this.offsetxto = 100;
        this.display = 'none';
        this.left = '0px';
        this.top = '0px';
        //this.setences = ;
        this.editIndex = 0;
        //this.domain = '';
        this.myElement = element;
    }

    editUtteranceClick(index: number): any {
        this.text = '';
        this.convertedText = '';
        //this.isnew = false;
        //this.isNewUtteranceActive = false;

        this.strSlot = '', this.offsetxfrom = -1, this.offsetxto = 100, this.wordsIndex = [], this.wordsSloted = [];

        //Sentence	Intent	Domain Slots[]	SlotStringXML
        this.text = '';
        //$scope.intents = [];
        //$scope.slots = [];
        this.words = [];
        this.inputDisable = false;
        this.display = 'none';
        this.mouseD = false;
        this.mouseU = true;
        //this.currentEditindex = this.setences.length;
        //this.setences.splice(this.currentEditindex, 1);

        this.setences = { sentence: this.utterRule.HotfixList[index].Sentence, domain: this.utterRule.DomainName, intent: this.utterRule.HotfixList[index].Intent, slots: this.pickupSlot(this.utterRule.HotfixList[index]), slotString: this.utterRule.HotfixList[index].SlotString, displayFlag: true };
        this.editSlot(1);
        this.intent = this.utterRule.HotfixList[index].Intent;
        this.editIndex = index;
    }

    saveUtterance(): any {

        if (this.intent === undefined || this.intent === null || this.intent.length === 0) {
            alert('Please select intent first');
            return;
        }

        var obj: Hotfix = {
            Intent: this.intent,
            DomainID: this.domainID,
            Sentence: (this.setences && this.setences.sentence) ? this.setences.sentence.trim() : this.text,
            SlotString: (this.setences && this.setences.slotString) ? this.setences.slotString.trim() : this.convertedText
        }

        //console.log('Here: ' + obj.Sentence + ' ' + obj.SlotString);

        if (this.isnew) {
            if (this.type == 'Hotfix Panel') {
                this.allModulesService.postHotfix(obj).subscribe(() => {
                    this.utterRule.HotfixList.push({
                        Intent: this.intent,
                        DomainID: this.domainID,
                        Sentence: (this.setences && this.setences.sentence) ? this.setences.sentence : this.text,
                        SlotString: (this.setences && this.setences.slotString) ? this.setences.slotString : this.convertedText,
                        DisplayFlag: true
                    });
                    this.cancelClick();
                }, error => { this.handleError(error) })
            } else {
                this.allModulesService.postBVT(obj).subscribe(() => {
                    this.utterRule.HotfixList.push({
                        Intent: this.intent,
                        DomainID: this.domainID,
                        Sentence: (this.setences && this.setences.sentence) ? this.setences.sentence : this.text,
                        SlotString: (this.setences && this.setences.slotString) ? this.setences.slotString : this.convertedText,
                        DisplayFlag: true
                    });
                    this.cancelClick();
                }, error => { this.handleError(error) })
            }
        } else {
            if (this.type == 'Hotfix Panel') {
                this.allModulesService.putHotfix(obj).subscribe(() => {
                    this.utterRule.HotfixList[this.editIndex].Intent = this.intent;
                    this.utterRule.HotfixList[this.editIndex].Sentence = (this.setences && this.setences.sentence) ? this.setences.sentence : this.text;
                    this.utterRule.HotfixList[this.editIndex].SlotString = (this.setences && this.setences.slotString) ? this.setences.slotString : this.convertedText;
                    this.cancelClick();
                }, error => { this.handleError(error) })
            } else {
                this.allModulesService.putBVT(obj).subscribe(() => {
                    this.utterRule.HotfixList[this.editIndex].Intent = this.intent;
                    this.utterRule.HotfixList[this.editIndex].Sentence = (this.setences && this.setences.sentence) ? this.setences.sentence : this.text;
                    this.utterRule.HotfixList[this.editIndex].SlotString = (this.setences && this.setences.slotString) ? this.setences.slotString : this.convertedText;
                    this.cancelClick();
                }, error => { this.handleError(error) })
            }

        }
        //this.isNewUtteranceActive = true;
    }

    textChange(): any {
        //this.domain = this.currentSkill.domain.Name;
        this.text = this.text.replace(/\s{2,}/g, ' ');
        //this.convertedText = this.text;
        this.convertedText = this.processConvertedText(this.text);
        // this.text = this.text.replace(/\,/g, ' ,');
        // this.text = this.text.replace(/\./g, ' .');
        // this.text = this.text.replace(/\?/g, ' ?');
        // this.text = this.text.replace(/\"/g, ' "');
        // this.text = this.text.replace(/\'/g, " '");
        // this.text = this.text.replace(/\s{2,}/g, ' ');
        //$scope.text = $scope.text.trim();
        this.words = this.convertedText.split(' ');
        this.wordsSloted = [];
        for (let word of this.words) {
            this.wordsSloted.push(0);
        }
    }


    pickupSlot(item: Hotfix): Array<SlotAction> {
        let tagPattern = /(<.[^(><.)]+>)/g;
        item.SlotString = this.processConvertedText(item.SlotString);
        let matchTag: Array<string> = item.SlotString.match(tagPattern);
        let all: Array<string> = item.SlotString.split(' ');
        //var a = fruits.indexOf("Apple");

        let index: number = 0;
        let tagFrom: number = -1;
        let tagTo: number = -1;
        let tagName: string = '';
        let result: Array<SlotAction> = [{ slot: "Slots", slottedfrom: 0, slottedto: 0, status: false }];
        matchTag && matchTag.map(tag => {
            if (index % 2 == 0) {
                tagName = tag.substring(1, tag.length - 1);
                tagFrom = all.indexOf(tag) - index;
            } else {
                tagTo = all.indexOf(tag) - index - 1;
                result.push({ slot: tagName, slottedfrom: tagFrom, slottedto: tagTo, status: true });
            }
            index += 1;
        })

        //return [{ slot: 'Slots', slottedfrom: 0, slottedto: 0, status: false }];
        return result;
    }


    slotSelect(slot: string): any {
        this.addSlotTag(slot);
        this.display = 'none';
        this.offsetxfrom == -1;
    }

    addSlotTag(slot: string): any {
        if (this.offsetxfrom > this.offsetxto) {
            var t = this.offsetxfrom;
            this.offsetxfrom = this.offsetxto;
            this.offsetxto = t;
        }

        //First check the status of words from offsetxfrom > offsetxto
        //if already exists, remove it
        this.newSlot = { 'slot': slot, 'slottedfrom': this.offsetxfrom, 'slottedto': this.offsetxto, 'status': true };
        var isSloted = false, i;

        if (this.wordsSloted.length > 0)
            this.removeSlot(this.offsetxfrom, this.offsetxto)

        if (slot.toLocaleLowerCase() == 'untag')
            return;

        var i, slotLen = this.setences.slots.length;
        for (i = 0; i < this.wordsSloted.length; i++) {
            if (this.offsetxfrom <= i && this.offsetxto >= i)
                this.wordsSloted[i] = slotLen;
            else
                this.wordsSloted[i] = this.wordsSloted[i] || 0;
        }

        var start = this.adjustStartPoint(this.words[this.offsetxfrom]);
        this.strSlot = this.setences.slotString || this.strSlot;
        this.strSlot = [this.strSlot.slice(0, this.wordsIndex[this.offsetxfrom] + start), '<' + slot + '> ', this.strSlot.slice(this.wordsIndex[this.offsetxfrom] + start)].join('');
        this.adjustIndex(this.offsetxfrom, slot.length + 3);

        var adLen = this.adjustLength(this.words[this.offsetxto]);

        if (adLen == 0) {
            this.strSlot = [this.strSlot.slice(0, this.wordsIndex[this.offsetxto] + this.words[this.offsetxto].length), ' </' + slot + '>', this.strSlot.slice(this.wordsIndex[this.offsetxto] + this.words[this.offsetxto].length)].join('');
            this.adjustIndex(this.offsetxto + 1, slot.length + 4);
        } else {
            this.strSlot = [this.strSlot.slice(0, this.wordsIndex[this.offsetxto] + this.words[this.offsetxto].length - adLen), ' </' + slot + '> ', this.strSlot.slice(this.wordsIndex[this.offsetxto] + this.words[this.offsetxto].length - adLen)].join('');
            this.adjustIndex(this.offsetxto + 1, slot.length + 5);
        }
        //alert(strSlot);
        //var len = $scope.setences.length;
        this.setences.slotString = this.strSlot;
        this.setences.slots.push(this.newSlot);
    }

    removeSlot(from, to): any {
        var isSloted = false, i;
        for (i = from; i <= to; i++) {
            if (this.wordsSloted[i] > 0) {
                isSloted = true;
                break;
            }
        }

        if (isSloted) {
            //if (this.isnew)
            this.removeSlotIndex(this.wordsSloted[i]);
            //else
            //    this.removeSlotIndex(this.wordsSloted[i] - 1);
            this.removeSlot(i + 1, to);
        }
    }

    removeSlotIndex(index): any {
        //var len = $scope.setences.length;
        var slot: SlotAction = this.setences.slots[index];
        var outLen: number = slot.slot.length + 4;

        var str: string = this.setences.slotString;
        var adjust: number = this.adjustLength(this.words[slot.slottedto]);

        if (adjust > 0)
            str = [str.slice(0, this.wordsIndex[slot.slottedto] + this.words[slot.slottedto].length - adjust), str.slice(this.wordsIndex[slot.slottedto] + this.words[slot.slottedto].length + outLen + 1 - adjust)].join('');
        else
            str = [str.slice(0, this.wordsIndex[slot.slottedto] + this.words[slot.slottedto].length), str.slice(this.wordsIndex[slot.slottedto] + this.words[slot.slottedto].length + outLen)].join('');

        adjust = this.adjustStartPoint(this.words[slot.slottedfrom]);
        str = [str.slice(0, this.wordsIndex[slot.slottedfrom] - outLen + 1 + adjust), str.slice(this.wordsIndex[slot.slottedfrom] - adjust)].join('');
        this.setences.slotString = str;

        this.adjustIndex(slot.slottedto + 1, - outLen);
        this.adjustIndex(slot.slottedfrom, 1 - outLen);

        var i: number;
        for (i = slot.slottedfrom; i <= slot.slottedto; i++) {
            this.wordsSloted[i] = 0;
        }
        slot.status = false;

    }

    adjustLength(word: string): number {
        if (word == null || word == undefined || word.length == 0)
            return 0;
        var regexp = /[a-z,A-Z0-9:@%\- ]+/g;

        var matches = word.match(regexp);

        return matches != null ? word.length - matches[0].length : 0;
        //return matches != null? word.length - matches.index - matches[0].length: 0;
    }

    adjustStartPoint(word: string): number {
        if (word == null || word == undefined || word.length == 0)
            return 0;
        var regexp = /[a-z,\',A-Z0-9:@%\-]+/g;
        var found = word.match(regexp);

        return found != null ? word.lastIndexOf(found[found.length - 1]) : 0;
    }


    adjustIndex(IndexFrom, len) {
        var i;
        for (i = IndexFrom; i < this.wordsIndex.length; i++) {
            this.wordsIndex[i] = this.wordsIndex[i] + len;
        }
    }

    mouseDown(): any {
        this.mouseD = true;
        this.mouseU = false;
        this.offsetxfrom = -1;
    }
    mouseUp(): any {
        var str = '';
        if (window.getSelection) {
            str = window.getSelection().toString().trim();
        } else {
            str = document.getSelection().toString().trim();
        }

        if (str.length == 0) {
            this.offsetxfrom = -1;
            this.offsetxto = 100
            this.mouseD = false;
            this.mouseU = true;
            return;
        }

        this.mouseD = false;
        this.mouseU = true;
        this.offsetxto = -1;
    }

    mouseMoving(index, word, event): any {
        if (this.mouseD && this.offsetxfrom == -1) {
            if (word.length == 0)
                this.offsetxfrom = index + 1;
            else
                this.offsetxfrom = index;

            this.inputDisable = true;
        }

        if (this.mouseU && this.offsetxto == -1 && this.offsetxfrom != -1) {
            //this.inputDisable = false;
            this.offsetxto = index;
            this.annotationEdit(index, event);
        }
    }

    annotationEdit(index, event): any {
        if (this.intent === undefined || this.intent === null || this.intent.length === 0) {
            //console.log('Please select intent!');
            alert('Please select intent first');
            return;
        }

        //this.strSlot = this.text;
        this.strSlot = this.convertedText;

        if (!this.setences || !this.setences.sentence || this.setences.sentence != this.text) {
            this.setences = { sentence: this.text, domain: this.domain, intent: this.intent, slots: [{ slot: 'Slots', slottedfrom: 0, slottedto: 0, status: false }], slotString: this.strSlot, displayFlag: true };

            var position = 0;
            this.wordsIndex = [];

            for (let word of this.words) {
                this.wordsIndex.push(position);
                position += word.length + 1;
            }
        }

        this.display = 'block';
        this.left = event.clientX + 'px';
        this.top = (event.clientY + 15) + 'px';
    }

    editSlot(index): any {
        this.text = this.setences.sentence.replace(/\s{2,}/g, ' ');
        //this.convertedText = this.text;
        this.convertedText = this.processConvertedText(this.text);

        this.words = this.convertedText.split(' ');
        this.wordsSloted = [];
        var position: number = 0;
        this.wordsIndex = [];

        for (let word of this.words) {
            this.wordsSloted.push(0);
            this.wordsIndex.push(position);
            position += word.length + 1;
        }

        var i: number, len: number, slot: SlotAction;
        for (i = 0; i < this.setences.slots.length; i++) {
            if (!this.setences.slots[i].status) continue;
            slot = this.setences.slots[i];
            this.strSlot = this.setences.slotString;
            if (slot.status) {
                var t: number;
                for (t = slot.slottedfrom; t <= slot.slottedto; t++)
                    this.wordsSloted[t] = i;
                this.adjustIndex(slot.slottedfrom, slot.slot.length + 3);

                len = this.adjustLength(slot.slot);
                if (len > 0)
                    this.adjustIndex(slot.slottedto + 1, slot.slot.length + 5);
                else
                    this.adjustIndex(slot.slottedto + 1, slot.slot.length + 4);
            }
        }
    }

    processConvertedText(str: string): string{
        str = str.replace(/\,/g, ' ,');
        str = str.replace(/\./g, ' .');
        str = str.replace(/\?/g, ' ?');
        str = str.replace(/\"/g, ' "');
        str = str.replace(/\'/g, " '");
        str = str.replace(/\s{2,}/g, ' ');

        return str;
    }

    handleError(error: ErrorMessage) {
        alert(error.message);
    }

    cancelClick() {
        this.intent = "";
        this.inputDisable = false;
        this.text = "";
        this.words = [];
        this.wordsSloted = [];
        this.mouseD = false;
        this.mouseU = true;
        this.offsetxfrom = -1;
        this.offsetxto = 100;
        this.display = 'none';
        this.left = '0px';
        this.top = '0px';
        //this.setences = ;
        this.editIndex = 0;
        this.setences = { sentence: "", domain: this.domain, intent: "", slots: [], slotString: "", displayFlag: true };
        //this.domain = '';
        this.myElement.nativeElement
            .dispatchEvent(new CustomEvent('query-event', {
                detail: null,
                bubbles: true
            }));
    }

    submitClick() {
        this.cancelClick();
    }
}
