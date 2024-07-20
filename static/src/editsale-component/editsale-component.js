/** @odoo-module */
import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry"


class EditSaleComponent extends Component {
    static template = 'sale-webclient.EditSaleComponent';

    
    setup() {
        this.state = useState({ value: 1 });
    }

    increment() {
        this.state.value++;
    }
}

registry.category("public_components").add("sale-webclient.EditSaleComponent", EditSaleComponent);

