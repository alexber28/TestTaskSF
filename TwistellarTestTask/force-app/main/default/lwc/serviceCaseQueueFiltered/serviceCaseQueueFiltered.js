import { LightningElement, track, wire } from 'lwc';
import getUserCases from '@salesforce/apex/ServiceCaseQueueService.getUserCases';
import CASE_OBJECT from '@salesforce/schema/Case';
import TYPE_FIELD1 from '@salesforce/schema/Case.Priority';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
 
const columns = [
    { label: 'Case Number', fieldName: 'CaseURL', type: 'url',
        typeAttributes:{
        label: {
            fieldName: 'CaseNumber'
        }}    
    },
    { label: 'Assignee', fieldName: 'OwnerId', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text',},
    { label: 'Origin', fieldName: 'Origin', type: 'text' },
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' },
    {
        label: 'Priority', fieldName: 'Priority', type: 'picklistColumn', editable: true, typeAttributes: {
            placeholder: 'Choose Type', options: { fieldName: 'pickListOptions' }, 
            value: { fieldName: 'Priority' },
            context: { fieldName: 'Id' }
        }
    }
]

export default class ServiceCaseQueueFiltered extends LightningElement {
    columns = columns;
    showSpinner = false;
    @track data = [];
    @track accountData;
    @track draftValues = [];
    lastSavedData = [];
    @track pickListOptions;
 
    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    objectInfo;
 
    @wire(getPicklistValues, {
        recordTypeId: "$objectInfo.data.defaultRecordTypeId",
        fieldApiName: TYPE_FIELD1
    })
 
    wirePickList({ error, data }) {
        if (data) {
            this.pickListOptions = data.values;
        } else if (error) {
            console.log(error);
        }
    }
 
    @wire(getUserCases, { pickList: '$pickListOptions' })
    accountData(result) {
        this.accountData = result;
        if (result.data) {
            //console.log("data");
            this.data = JSON.parse(JSON.stringify(result.data));
 
            this.data.forEach(ele => {
                ele.pickListOptions = this.pickListOptions;
                ele['CaseURL'] = '/lightning/r/Case/' +ele['Id'] +'/view';
            })
 
            this.lastSavedData = JSON.parse(JSON.stringify(this.data));
 
        } else if (result.error) {
            this.data = undefined;
        }
    };
 
    updateDataValues(updateItem) {
        let copyData = JSON.parse(JSON.stringify(this.data));
 
        copyData.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });

        this.data = [...copyData];
    }
 
    updateDraftValues(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.draftValues];

        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
 
        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem];
        }
    }
 
    handleCellChange(event) {
        let draftValues = event.detail.draftValues;
        draftValues.forEach(ele=>{
            this.updateDraftValues(ele);
        })
    }
 
    handleSave(event) {
        this.showSpinner = true;
        this.saveDraftValues = this.draftValues;
 
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
 
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.showToast('Success', 'Case Records Updated Successfully!', 'success', 'dismissable');
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            console.log(error);
            this.showToast('Error', 'Case Records are not Updated!', 'error', 'dismissable');
        }).finally(() => {
            this.draftValues = [];
            this.showSpinner = false;
        });
    }
 
    handleCancel(event) {
        this.data = JSON.parse(JSON.stringify(this.lastSavedData));
        this.draftValues = [];
    }
 
    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }
 
    async refresh() {
        await refreshApex(this.accountData);
    }
}