import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UploadSchemaResponse } from '../../models/objects';
import { environment } from '../../../environments/environment';
import { SpinnerModule } from 'angular2-spinner/dist';

@Component({
    selector: 'upload-comp',
    templateUrl: 'upload.component.html',
    styleUrls: ['./upload.component.css']
})

export class UploadComponent {
    private url: string = environment.APIURL;

    @Input() type: string;
    @Input() domainID: string;
    @Input() taskName: string;
    @Input() isAdmin: Boolean;
    @Input() UHRStype: string;

    channelBusy: Boolean;
    //left: string;
    //top: string;

    filesToUpload: Array<File>;
    @Output() fileuploaded = new EventEmitter<any>();
    @Output() uploadCanceled = new EventEmitter<string>();

    constructor() {
        this.filesToUpload = [];
        this.channelBusy = false;
        //this.left = (window.screen.width / 2) + 'px';
        //this.top = (window.screen.height / 2) + 'px';
    }

    upload() {
        //console.log(this.type);
        //console.log(this.domainID);
        let apiuploadURL: string = this.url + "/api/" + this.type;

        if(this.type.toLowerCase() === 'bvt' || this.type.toLowerCase() === 'hotfix') {
            // Upload for annotation type
            //apiuploadURL = apiuploadURL + "/upload?domainID="+ this.domainID;
            apiuploadURL = apiuploadURL + "/upload";
            this.channelBusy = true;
            this.makeFileRequest(apiuploadURL, this.domainID, this.filesToUpload).then((result) => {
                this.channelBusy = false;
                let resultArray = <Array<UploadSchemaResponse>>result;
                this.fileuploaded.emit(resultArray);
            }, (error) => {
                this.channelBusy = false;
                alert(error);
            });
        } else if(this.type.toLowerCase() === 'domainrouting') {

            if(!this.taskName || this.taskName.length === 0)
            {
                this.uploadCanceled.emit("please give the task name");
                return;
            }
            else if(this.domainID.length === 0) {
                this.uploadCanceled.emit('please select at least one domain');
                return;

            }
            else if(this.filesToUpload.length == 0) {
                this.uploadCanceled.emit("please upload the task file");
                return;
            }
            this.channelBusy = true;
            this.makeFileRequest(apiuploadURL, this.domainID, this.filesToUpload).then((result) => {
                this.channelBusy = false;
                this.fileuploaded.emit(result);
            }, (error) => {
              this.channelBusy = false;
              let errorObj = JSON.parse(error);
              if(errorObj == null){
                alert(error);
              }
              else{
                this.uploadCanceled.emit(errorObj.Message);
              }
            });

        }
        else {
            apiuploadURL = apiuploadURL + "/import";
            this.makeFileRequest(apiuploadURL, null, this.filesToUpload).then((result) => {
                let resultArray = <Array<string>>result;
                this.fileuploaded.emit(resultArray);
            }, (error) => {
                this.uploadCanceled.emit("calling API failed");
            });
        }
    }

    fileChangeEvent(fileInput: any){
        this.filesToUpload = <Array<File>> fileInput.target.files;
    }

    cancelUpload(){
      this.uploadCanceled.emit("cancel upload");
    }

    makeFileRequest(url: string, domainID: string, files: Array<File>) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            for(var i = 0; i < files.length; i++) {
                formData.append("uploads[]", files[i], files[i].name);
            }
            if(domainID)
                formData.append("DomainID", domainID);


            if(this.type.toLowerCase() === 'domainrouting') {
                formData.append("TaskName", this.taskName);
                formData.append("Type", this.UHRStype);
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                        //this.fileuploaded.emit();
                    } else {
                        reject(xhr.response);
                    }
                }
            }

            xhr.open("POST", url, true);
            let token = sessionStorage.getItem('access_token');
            xhr.setRequestHeader('Authorization', 'bearer ' + token);
            xhr.send(formData);
        });
    }
}
