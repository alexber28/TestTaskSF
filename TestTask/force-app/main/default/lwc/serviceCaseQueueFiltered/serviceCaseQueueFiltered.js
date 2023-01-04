import { LightningElement, wire } from 'lwc';
import getUserCases from '@salesforce/apex/ServiceCaseQueueService.getUserCases';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import CASE_OBJECT from '@salesforce/schema/Case';
import PRIORITY_FIELD from '@salesforce/schema/Case.Priority';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    { label: 'Case Number', fieldName: 'CaseNumber', type: 'url',
        typeAttributes: { label: { fieldName:'Case Number'}, target: '_blank'}
    },
    { label: 'Assignee', fieldName: 'OwnerId', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text', editable: true },
    { label: 'Priority', fieldName: 'Priority', type: 'priorityPicklist', wrapText: true,
        typeAttributes: {
            options: {fieldName: 'picklistOptions'},
            value: {fieldName: 'Priority'},
            placeholder: 'Choose Priority'
        }
    },
    { label: 'Origin', fieldName: 'Origin', type: 'text' },
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' },
];

export default class BasicDatatable extends LightningElement {

    columns = COLUMNS;
    cases = [];
    casePriority = [];
    ldsItemValues = [];

    @wire(getObjectInfo, {objectApiName: CASE_OBJECT})
    caseObjectMetaData;

    @wire(getPicklistValues, {recordTypeId: '$caseObjectMetaData.data.defaultRecordTypeId', fieldApiName: PRIORITY_FIELD})
    CasePriorityPicklist({data, error}) {
        if(data) {
            this.casePriority = data.values;
            this.fetchCases();
        } else if (error) {
            this.error = error;
        }
    }

    fetchCases(){
        getUserCases()
        .then((result) => {

            let tempRecs = [];
            result.forEach((record) => {
                let tempRec = Object.assign( {}, record);
                tempRec.CaseNumber = '/' + tempRec.Id;
                tempRecs.push(tempRec);
            });

            let options = [];
            for(var key in this.casePriority) {
                options.push({ label: this.casePriority[key].label, value: this.casePriority[key].value });
            }

            this.cases = tempRecs.map((record) => {
                return {
                    ...record,
                    'picklistOptions': options
                }
            });
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            this.cases = undefined;
        })
    }

    handleSave(event) {
        this.fldsItemValues = event.detail.draftValues;
        console.log("_updatedField: " + event.detail.draftValues);
        console.log("_action.name: " + event.detail.action.name);

        // const inputsItems = this.fldsItemValues.slice().map(draft => {
        //     const fields = Object.assign({}, draft);
        //     console.log("fields: " + fields);
        //     return { fields };
        // });


        // console.log("1");
        // console.log("imputsItems: " + inputsItems);
        // const promises = inputsItems.map(recordInput => updateRecord(recordInput));

        // console.log("2");
        // Promise.all(promises).then(res => {
        //     this.dispatchEvent(
        //         new ShowToastEvent({
        //             title: 'Success',
        //             message: 'Records Updated Successfully!!',
        //             variant: 'success'
        //         })
        //     );
        //     this.fldsItemValues = [];
        //     return this.refresh();
        // }).catch(error => {
        //     this.dispatchEvent(
        //         new ShowToastEvent({
        //             title: 'Error',
        //             message: 'An Error Occured!!',
        //             variant: 'error'
        //         })
        //     );
        // }).finally(() => {
        //     this.fldsItemValues = [];
        // });
    }
   
    async refresh(event) {
        console.log("3");
        await refreshApex(this.cases);
        // this.fldsItemValues = event.detail.draftValues;
        // console.log("_updatedField: " + event.detail.draftValues);
        // console.log("_action.name: " + event.detail.action.name);

        // const inputsItems = this.fldsItemValues.slice().map(draft => {
        //     const fields = Object.assign({}, draft);
        //     console.log("fields: " + fields);
        //     return { fields };
        // });


        // console.log("1");
        // console.log("imputsItems: " + inputsItems);
        // const promises = inputsItems.map(recordInput => updateRecord(recordInput));

        // console.log("2");
        // Promise.all(promises).then(res => {
        //     this.dispatchEvent(
        //         new ShowToastEvent({
        //             title: 'Success',
        //             message: 'Records Updated Successfully!!',
        //             variant: 'success'
        //         })
        //     );
        //     this.fldsItemValues = [];
        //     //return this.refresh();
        // }).catch(error => {
        //     this.dispatchEvent(
        //         new ShowToastEvent({
        //             title: 'Error',
        //             message: 'An Error Occured!!',
        //             variant: 'error'
        //         })
        //     );
        // }).finally(() => {
        //     this.fldsItemValues = [];
        // });
        
    }

    // @wire(getUserCases)
    // listOfCases({data, error}){
    //     if(data) {
    //         this.cases = data;
    //         this.error = undefined;
    //     } else if (error) {
    //         console.log("not data");
    //         this.error = error;
    //     }
    // }

}
