import LightningDatatable from 'lightning/datatable';
import customTypePicklist from './customTypePicklist.html';

export default class CustomTypePicklist extends LightningDatatable {
    static customTypes = {
        priorityPicklist: {
            template: customTypePicklist,
            standardCellLayout: true,
            typeAttributes: ['label', 'value', 'placeholder', 'options']
        }
    }

    handleChange(event) {
        const actionName = event.detail.value;
        console.log("_creating event: " + actionName);
        this.dispatchEvent(new CustomEvent('reloadtable'));
    }

    handleClick(event) {
        console.log("You clicked!");
    }

    handleClick1(event) {
        //вообще ничего не происходит даже при нажатии на кнопку рядом, а не на пиклист
        //событие не срабаьывает 
        console.log("You clicked 1!");
    }

}