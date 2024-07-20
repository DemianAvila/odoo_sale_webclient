/** @odoo-module */
import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry"


class SaleListController {
  constructor (){
    this.url = window.location.host
    this.api_route_sale_list = "/sale-webclient/sales"
    this.protocol = window.location.protocol
  }

  getURL(){
    return this.url
  }

  getAPIRouteSales(){
    return this.api_route_sale_list
  }

  getProtocol(){
    return this.protocol
  }

  async getSalesList(){
    try {
      const response = await fetch(`${this.protocol}//${this.getURL()}${this.getAPIRouteSales()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); 
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null; 
    }
  }
}

class SaleListComponent extends Component {
    static template = 'sale-webclient.SaleListComponent';

    
    async setup() {
        console.log("component is being rendered")
        this.state = useState({ value: 1 });
        this.controller = new SaleListController();
        this.salesList = await this.controller.getSalesList()
        console.log(this.salesList)
    }

    /*async getSales(){
      
    }*/

    increment() {
        this.state.value++;
    }
}

registry.category("public_components").add("sale-webclient.SaleListComponent", SaleListComponent);

