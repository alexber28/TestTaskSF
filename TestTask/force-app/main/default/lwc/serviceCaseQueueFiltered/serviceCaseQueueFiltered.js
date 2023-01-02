import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getUserCases from '@salesforce/apex/ServiceCaseQueueService.getUserCases';

export default class BasicDatatable extends LightningElement {
    @wire(getUserCases) cases;
    //@api recordId;

    clickOnCase (component, event, helper) {
        let recordId1 = event.target.id;

        console.log("You clicked, recordId: " + recordId1);

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId1,
                objectApiName: 'Case',
                actionName: 'view'
            },
        });

        console.log("End of event");
    }

}
