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
        this.api_route_product_get = "/sale-webclient/products"
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

    getAPIRouteProduct(){
      return this.api_route_product_get
    }

    insertClientAndDate(client, date){
      const divClient = document.createElement('div'); 
      divClient.setAttribute("style", "width: 50%")
      const searchClient = document.createElement('p');
      searchClient.textContent = `Client: ${client}`;
      const divDate = document.createElement('div');
      divDate.setAttribute("style", "width: 50%")
      const dateParragraph = document.createElement('p')
      dateParragraph.textContent = `Order date: ${date}`;
      divDate.appendChild(dateParragraph);
      const clientNode = this.getClientNode();
      clientNode.appendChild(divClient);
      clientNode.appendChild(divDate);
      divClient.appendChild(searchClient);
    }

    getTableNode(){
      return document.getElementById("data");
    }

    getSubtotal(element, qty, price){
      return `(()=>{
        let sub = document.getElementById(${element});
        sub.textContent = ${qty}*${price}
      })()`
    }

    insertProducts(productList){
      let tableRow = null;
      let dataProduct = null;
      let dataQty = null;
      let dataPrice = null;
      let dataAction = null;
      let button = null;
      let elementID = null;
      let qtyInput = null;
      let priceInput = null;
      let dataSubtotal = null;
      let subtotal = null;
      let subtotalID = null;

      productList.forEach((element, index) => {
        tableRow = document.createElement("tr");
        elementID = `prod_${index}`
        subtotalID = `subtotal_${index}`
        tableRow.setAttribute("id", elementID)
        dataProduct = document.createElement("td");
        dataProduct.textContent = element.product;
        dataQty = document.createElement("td");
        qtyInput = document.createElement("input");
        qtyInput.value = element.quantity
        dataQty.appendChild(qtyInput);
        dataPrice = document.createElement("td");
        priceInput = document.createElement("input");
        priceInput.value = element.unit_price
        dataPrice.appendChild(priceInput);
        dataSubtotal = document.createElement("td");
        subtotal = document.createElement("p");
        
        subtotal.setAttribute("id", subtotalID);
        subtotal.textContent = element.quantity * element.unit_price;
        dataSubtotal.appendChild(subtotal);
        dataAction = document.createElement("td");
        button = document.createElement("button");
        button.textContent = "X";
        button.setAttribute("onclick", `document.getElementById('${elementID}').remove()`)
        dataAction.appendChild(button);
        tableRow.appendChild(dataProduct);
        tableRow.appendChild(dataQty);
        tableRow.appendChild(dataPrice);
        tableRow.appendChild(dataSubtotal);
        tableRow.appendChild(dataAction);
        this.getTableNode().appendChild(tableRow)
      });
    }

    async getProductFromAPI(name) {
        let url = `${this.protocol}//${this.getURL()}${this.getAPIRouteProduct()}?namesearch=${name}`
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

    async getSaleFromAPI() {
        let url = `${this.protocol}//${this.getURL()}${this.getAPIRouteSale()}?id=${this.getSaleID()}`
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
    
    getDropdownMenu(){
      return document.getElementById("search-prod")
    }

    getSearchBar(){
      return document.getElementById("search-bar")
    }

    dropSearchItems(){
      this.getDropdownMenu().innerHTML=""
    }

    addSearchItem(prodItem){
      let dropdown = this.getDropdownMenu();
      let list_element = document.createElement("li");
      let link = document.createElement("a");
      link.textContent = prodItem.name
      link.setAttribute("class", "dropdown-item")
      link.setAttribute("onclick", `document.getElementById('search-bar').value = '${prodItem.name}'`)
      list_element.appendChild(link)
      dropdown.appendChild(list_element)
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
        this.editController.insertTitle(this.edit_data.name)
        this.editController.insertClientAndDate(this.edit_data.customer_name, this.edit_data.order_date)
        this.editController.insertProducts(this.edit_data.products)
    }
    
    _search(event){
      (async()=>{
        let data = await this.editController.getProductFromAPI(event.target.value);
        this.editController.dropSearchItems()
        data.products.forEach(element => {
          this.editController.addSearchItem(element)
        });
      })()
    }
}

registry.category("public_components").add("sale-webclient.EditSaleComponent", EditSaleComponent);
