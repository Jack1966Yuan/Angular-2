import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { UhrsTaskAnnotationContent, UHRSAnnotationEntry, UHRSAnnotationReviewResult, ErrorMessage, MultiSelectItem } from '../../models/objects';
import { AllModulesService } from '../../services/modules.service';
import { SpinnerModule } from 'angular2-spinner/dist';

@Component({
  selector: 'app-uhrs-content',
  templateUrl: './uhrs-content.component.html',
  styleUrls: ['./uhrs-content.component.css']
})
export class UhrsContentComponent implements OnInit {

  taskID: string;
  taskName: string;
  uhrsAnnotationContent: UhrsTaskAnnotationContent;
  isChannelBusy: boolean;
  isStatsReady: boolean;
  selectDomain: Array<string>;
  domainCountMap: Map<string, number>;

  domainCandidateList = [];
  domainIndexMap: Map<string, number>;

  domainDropdownSettings = {
    singleSelection: true,
    enableSearchFilter: true
  };



  @ViewChild('myAlert') alertComponent: AlertComponent;

  constructor(private router: ActivatedRoute, private allModulesService: AllModulesService) {
    this.taskID = this.router.snapshot.params['id'];
    this.taskName = sessionStorage.getItem('TaskName');
    this.isChannelBusy = true;
    this.isStatsReady = false;
    this.domainCountMap = new Map();
    this.domainIndexMap = new Map();
  }

  ngOnInit() {
    this.allModulesService.getUHRSTaskContent(this.taskID).subscribe(
      taskContent => {
         this.uhrsAnnotationContent = taskContent;
         this.selectDomain = JSON.parse(this.uhrsAnnotationContent.DomainList);
         this.selectDomain.sort();
         this.isChannelBusy = false;
         this.calculateStatictics();
         this.fillDomainSelectionData();
      }, error => {
        this.handleError(error);
      });
  }

  onDomainSelectChange(domain: string, item: UHRSAnnotationEntry) {
     this.decrementMapEntry(item.SelectedDomain);
     item.SelectedDomain = domain;
     this.incrementMapEntry(item.SelectedDomain);
  }

  fillDomainSelectionData() {
    let index = 0;
    this.domainCandidateList = [];
    this.selectDomain.map(item => {
      this.domainCandidateList.push({'id': index, 'itemName': item});
      this.domainIndexMap.set(item, index);
      index++;
    });
    this.uhrsAnnotationContent.AnnotationList.map(item => {
      const id = this.domainIndexMap.get(item.SelectedDomain);
      item.MultiSelectArray = [{'id' : id, 'itemName' : item.SelectedDomain}];
    });
  }

  onDomainSelected(selection: any, item: UHRSAnnotationEntry) {
    const prevDomain = item.SelectedDomain;
    this.decrementMapEntry(prevDomain);
    item.SelectedDomain = selection.itemName;
    this.incrementMapEntry(item.SelectedDomain);
  }

  onDomainDeselected(selection: any, item: UHRSAnnotationEntry) {
    alert('please select at least one domain');
    if (item.MultiSelectArray === null || item.MultiSelectArray.length === 0) {
      item.MultiSelectArray = [selection];
    }
  }

  calculateStatictics() {
     this.domainCountMap.clear();
     for (const curItem of this.uhrsAnnotationContent.AnnotationList) {
       this.incrementMapEntry(curItem.SelectedDomain);
     }

     this.isStatsReady = true;
  }

  incrementMapEntry(curDomain: string) {
    if (!this.domainCountMap.has(curDomain)) {
      this.domainCountMap.set(curDomain, 1);
    }else {
      const curValue = this.domainCountMap.get(curDomain);
      this.domainCountMap.set(curDomain, curValue + 1);
    }
  }

  decrementMapEntry(curDomain: string) {
    if (!this.domainCountMap.has(curDomain)) {
      return;
    }
    const curValue = this.domainCountMap.get(curDomain);
    this.domainCountMap.set(curDomain, curValue - 1);
  }

  getDomainCountFromMap(curDomain: string) {
    if (!this.domainCountMap.has(curDomain)) {
      return 0;
    }

    return this.domainCountMap.get(curDomain);
  }

  sortAnnotationListByDomain() {
    if (this.uhrsAnnotationContent == null) {
      return;
    }

    if (this.uhrsAnnotationContent.AnnotationList == null || this.uhrsAnnotationContent.AnnotationList.length === 0) {
      return;
    }

    this.uhrsAnnotationContent.AnnotationList.sort( (annotationItem1, annotationItem2) => {
      if (annotationItem1.SelectedDomain > annotationItem2.SelectedDomain) {
        return 1;
      } else if (annotationItem1.SelectedDomain < annotationItem2.SelectedDomain) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  sortAnnotationListByQuery() {
    if (this.uhrsAnnotationContent == null) {
      return;
    }

    if (this.uhrsAnnotationContent.AnnotationList == null || this.uhrsAnnotationContent.AnnotationList.length === 0) {
      return;
    }

    this.uhrsAnnotationContent.AnnotationList.sort( (annotationItem1, annotationItem2) => {
      if (annotationItem1.Query > annotationItem2.Query) {
        return 1;
      } else if (annotationItem1.Query < annotationItem2.Query) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  completeReview(result: UHRSAnnotationReviewResult) {
    const message = (result === UHRSAnnotationReviewResult.Approve)
    ? 'Please confirm to approve all annotatins'
    : 'Please confirm to reject all annotatins';

    const answer = confirm(message);
    if (!answer) {
        const element: string = (result === UHRSAnnotationReviewResult.Approve) ? 'approve_button' : 'reject_button';
        document.getElementById(element).blur();
        return;
    }

    console.log(result);
    this.allModulesService.postUHRSReviewResultToService(result, this.uhrsAnnotationContent).subscribe(
      res => {
        this.alertComponent.setAlert('Review Complete, now can close the window', 0);
      },
      error => {
        this.handleError(error);
      },
      () => {
        const element: string = (result === UHRSAnnotationReviewResult.Approve) ? 'approve_button' : 'reject_button';
        document.getElementById(element).blur();
      }
    );
  }

  handleError(error: ErrorMessage) {
    if (error.status === 401) {
      this.alertComponent.setAlert('Authorization has been denied, please refresh the page to re-new your session.', -1);
    } else {
      this.alertComponent.setAlert(error.message, -1);
    }
  }
}
