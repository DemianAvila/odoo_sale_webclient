/** @odoo-module */
import { Component, 
        useState, 
        onWillStart,
        onMounted} from "@odoo/owl";
import { registry } from "@web/core/registry"


class SaleListController {
  constructor (){
    this.url = window.location.host
    this.api_route_sale_list = "/sale-webclient/sales"
    this.protocol = window.location.protocol
    this.api_route_edit_sale="/sale-webclient/edit-sale"
    this.current_page = 1
    this.availablePages = 1
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

  getCurrentPage(){
    return this.current_page;
  }

  getAvailablePages(){
    return this.availablePages;
  }

  setAvailablePages(num){
    this.availablePages = num
  }

  setCurrentPage(page){
    this.current_page = page
  }

  isNextPage(){
    return this.getCurrentPage()<this.getAvailablePages()
  }

  nextPage(){
    if (this.isNextPage()){
      let next = this.getCurrentPage() + 1
      this.setCurrentPage(next)
    }
  }

  isPrevPage(){
    return !(this.getCurrentPage()==1)
  }

  prevPage(){
    if (this.isPrevPage()){
      this.setCurrentPage(this.getCurrentPage()-1)
    }
  }

  async getSalesList(page){
    try {
      const response = await fetch(`${this.protocol}//${this.getURL()}${this.getAPIRouteSales()}?page=${page}`);
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

  getPaginationNode(){
    return document.getElementById("pagination")
  }

  isLastPage(){
    return this.getCurrentPage()==this.getAvailablePages()
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

  containerDivPagination(){
    const divCont = document.createElement("div");
    divCont.setAttribute("style", "width:10%")
    return divCont;
  }

  renderPagination(){
    const pagNode = this.getPaginationNode()
    if (this.isPrevPage()){
      const prev_button = document.createElement("button");
      prev_button.setAttribute('class', "btn btn-primary rounded")
      prev_button.textContent = "←"
      const div = this.containerDivPagination()
      div.appendChild(prev_button)
      pagNode.appendChild(div)
    }

    const current_page = document.createElement("p")
    current_page.setAttribute('class', "btn btn-primary rounded");
    current_page.textContent = this.getCurrentPage()
    const div = this.containerDivPagination()
    div.appendChild(current_page)
    pagNode.appendChild(div)

    if (this.isNextPage()){
      const next_button = document.createElement("button");
      next_button.setAttribute('class', "btn btn-primary rounded")
      next_button.setAttribute('t-on-click', "this.refresh('nextPage')")
      next_button.textContent = "→"
      const div = this.containerDivPagination()
      div.appendChild(next_button)
      pagNode.appendChild(div)

    }

    if (this.getCurrentPage()!= this.getAvailablePages()){
      const dots = document.createElement("p")
      dots.textContent = "..."
      const div = this.containerDivPagination()
      div.appendChild(dots)
      pagNode.appendChild(div)


      const last_page_button = document.createElement("button");
      last_page_button.setAttribute('class', "btn btn-primary rounded")
      last_page_button.textContent = this.getAvailablePages()
      const divA = this.containerDivPagination()
      divA.appendChild(last_page_button)
      pagNode.appendChild(divA)
    }
  }

 
}

class SaleListComponent extends Component {
    static template = 'sale-webclient.SaleListComponent';

    async setup() {
      onWillStart( async () => {
        this.controller = new SaleListController(); 
        this.sales = await this.controller.getSalesList(1)
        this.controller.setAvailablePages(this.sales.pages)
      })
      
      onMounted(()=>{
        this.refresh(this.sales, this.controller);
        this.state.isNextPage = this.controller.isNextPage();
        this.state.isPrevPage = this.controller.isPrevPage()
      })

      this.state = useState({
          isNextPage: null,
          isPrevPage: null,
          currentPage: 1,
          isLastPage: null
      })
      
    }

    nextPage(){
      this.controller.nextPage();
      this.controller.getSalesList(this.controller.getCurrentPage()).then(
        (sales) => {
          this.refresh(sales, this.controller);
        }
      )
      this.updatePaginationButtons()
    }

    prevPage(){
      this.controller.prevPage();
      this.controller.getSalesList(this.controller.getCurrentPage()).then(
        (sales) => {
          this.refresh(sales, this.controller);
        }
      )
      this.updatePaginationButtons()
    }
    
    lastPage(){
      this.controller.setCurrentPage(this.controller.getAvailablePages());
      this.controller.getSalesList(this.controller.getAvailablePages()).then(
        (sales) => {
          this.refresh(sales, this.controller);
        }
      )
      this.updatePaginationButtons()
    }
    updatePaginationButtons(){
      this.state.isNextPage = this.controller.isNextPage();
      this.state.isPrevPage = this.controller.isPrevPage();
      this.state.currentPage = this.controller.getCurrentPage();
      this.state.isLastPage = this.controller.isLastPage();
    }

    refresh(sales, controller){
      controller.getListNode().innerHTML=""
      sales.sales.forEach(element => {
        controller.insertListColumn(element)
      })
    }
}

registry.category("public_components").add("sale-webclient.SaleListComponent", SaleListComponent);

