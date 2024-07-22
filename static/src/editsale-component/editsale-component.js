/** @odoo-module */
import {
    Component,
    useState
} from "@odoo/owl";
import {
    registry
} from "@web/core/registry"


class EditSaleController{
    constructor() {
        this.sale_id = this.getSaleIDFromURL()
        this.url = window.location.host
        this.api_route_sale_get = "/sale-webclient/sale"
        this.protocol = window.location.protocol
    }

    getURL() {
        return this.url;
    }

    getAPIRouteSale() {
        return this.api_route_sale_get;
    }

    getProtocol() {
        return this.protocol;
    }

    getSaleID() {
        return this.sale_id;
    }

    getSaleIDFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const sale_id = urlParams.get('sale_id');
        return sale_id
    }

    getTitleNode(){
      let title_node = document.getElementById("title")
      return title_node
    }

    insertTitle(title){
      this.getTitleNode().textContent =title
    }

    getClientNode(){
      let client_node = document.getElementById("client")
      return client_node
    }

    insertClientAndDate(client, date){
      const divClient = document.createElement('div'); 
      divClient.setAttribute("style", "width: 50%")
      const searchClient = document.createElement('input');
      searchClient.setAttribute("type", "text");
      searchClient.value = client;
      const divDate = document.createElement('div');
      divDate.setAttribute("style", "width: 50%")
      const dateParragraph = document.createElement('p')
      dateParragraph.textContent = date;
      divDate.appendChild(dateParragraph);
      const clientNode = this.getClientNode();
      clientNode.appendChild(divClient);
      clientNode.appendChild(divDate);
      divClient.appendChild(searchClient);
    }

    getTableNode(){
      return document.getElementById("data");
    }

    insertProducts(productList){
      let tableRow = null;
      let dataProduct = null;
      let dataQty = null;
      let dataPrice = null;
      let dataAction = null;
      let button = null;

      productList.forEach(element => {
        tableRow = document.createElement("tr");
        dataProduct = document.createElement("td");
        dataProduct.textContent = element.product;
        dataQty = document.createElement("td");
        dataQty.textContent = element.quantity;
        dataPrice = document.createElement("td");
        dataPrice.textContent = element.unit_price;
        dataAction = document.createElement("td");
        button = document.createElement("button");
        button.textContent = "X"
        dataAction.appendChild(button);
        tableRow.appendChild(dataProduct);
        tableRow.appendChild(dataQty);
        tableRow.appendChild(dataPrice);
        tableRow.appendChild(dataAction);
        this.getTableNode().appendChild(tableRow)
      });
    }

    async getSaleFromAPI() {
        let url = `${this.protocol}//${this.getURL()}${this.getAPIRouteSale()}?id=${this.getSaleID()}`
        console.log(url) 
        try {
            const response = await fetch(url);
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

class EditSaleComponent extends Component {
    static template = 'sale-webclient.EditSaleComponent';


    async setup() {
        this.state = useState({
            value: 1
        });
        this.editController = new EditSaleController();
        this.edit_data = await this.editController.getSaleFromAPI()
        console.log(this.editController.getSaleID())
        console.log(this.edit_data)
        this.editController.insertTitle(this.edit_data.name)
        this.editController.insertClientAndDate(this.edit_data.customer_name, this.edit_data.order_date)
        this.editController.insertProducts(this.edit_data.products)
    }

    increment() {
        this.state.value++;
    }
}

registry.category("public_components").add("sale-webclient.EditSaleComponent", EditSaleComponent);
