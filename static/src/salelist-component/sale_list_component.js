/** @odoo-module */
import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry"


class SaleListController {
  constructor (){
    this.url = window.location.host
    this.api_route_sale_list = "/sale-webclient/sales"
    this.protocol = window.location.protocol
    this.api_route_edit_sale="/sale-webclient/edit-sale"
  }

  getURL(){
    return this.url;
  }

  getAPIRouteSales(){
    return this.api_route_sale_list;
  }

  getProtocol(){
    return this.protocol;
  }

  getAPIRouteEditSale(){
    return this.api_route_edit_sale;
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

  getListNode(){
    return document.getElementById("list");
  }

  getEditSaleEndpoint(id){
    return `${this.protocol}//${this.getURL()}${this.getAPIRouteEditSale()}?sale_id=${id}`;
  }
  
  insertListColumn(sale){
    const divColumnList = document.createElement('div'); 
    divColumnList.setAttribute('style',"height: 100%; width: 100%; display: flex; flex-direction: row; justify-content:space-between;")
    const name = document.createElement('a'); 
    name.textContent = sale.name;
    name.setAttribute('href', this.getEditSaleEndpoint(sale.name));
    const client = document.createElement('p'); 
    client.textContent = sale.customer_name
    const placedAt = document.createElement('p'); 
    placedAt.textContent = sale.order_date
    divColumnList.appendChild(name);
    divColumnList.appendChild(client);
    divColumnList.appendChild(placedAt);
    this.getListNode().appendChild(divColumnList);
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
        this.salesList.sales.forEach(element => {
          this.controller.insertListColumn(element)
        });
    }

    /*async getSales(){
      
    }*/

    increment() {
        this.state.value++;
    }
}

registry.category("public_components").add("sale-webclient.SaleListComponent", SaleListComponent);

