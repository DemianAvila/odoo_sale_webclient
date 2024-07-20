/** @odoo-module */
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry"

class SaleListComponent extends Component {
    static template = 'sale-webclient.SaleListComponent';

    
    setup() {
        console.log("component is being rendered")
        this.state = useState({ value: 1 });
    }

    increment() {
        this.state.value++;
    }
}

registry.category("public_components").add("sale-webclient.SaleListComponent", SaleListComponent);

