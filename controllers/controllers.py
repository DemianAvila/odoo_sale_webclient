#-*- coding: utf-8 -*-
import json
import re
from odoo import http
from odoo.http import request
import logging
import datetime
import math 


class SaleWebclientController(http.Controller):
    def process_names(self, name):
        processed = name[:]
        processed = list(filter(lambda x: x != " ", processed))
        processed = list(map(lambda x: x.lower(), processed))
        processed = "".join(processed)
        return processed

    def compare_processed(self, pattern, name):
        return re.search(pattern, name)

    @http.route(route='/sale-webclient/clients', 
                auth= 'public',
                type= 'http',
                methods= ['get'])
    def get_clients(self, 
              namesearch=".*", 
              maxqueries=5, 
              **kw):
        if namesearch!=".*":
            namesearch = f".*{namesearch.lower()}.*"
        clients = request.env["res.partner"].search([])
        client_list = []
        query_count = 0
        for client in clients:
            processed = self.process_names(client.name)
            if self.compare_processed(namesearch, processed):
                client_list.append({
                    "id": client.id,
                    "name": client.name,
                    "processed": processed
                })
                query_count += 1
            if query_count==maxqueries:
                break
            
        return json.dumps({
            "clients": client_list
        }) 

    @http.route(route='/sale-webclient/products', 
                auth= 'public',
                type= 'http',
                methods= ['get'])
    def get_products(self, 
              namesearch=".*", 
              maxqueries=5, 
              **kw):
        if namesearch!=".*":
            namesearch = f".*{namesearch.lower()}.*"
        products = request.env["product.template"].search([])
        product_list = []
        query_count = 0
        for product in products:
            processed = self.process_names(product.name)
            if self.compare_processed(namesearch, processed):
                product_list.append({
                    "id": product.id,
                    "name": product.name,
                    "processed": processed
                })
                query_count += 1
            if query_count==maxqueries:
                break
                
        return json.dumps({
            "products": product_list
        }) 

    @http.route('/sale-webclient/sales-list', 
                auth='public', 
                website=True)
    def list_sales(self, **kw):
        return http.request.render('sale-webclient.SaleListTemplate')

    @http.route(route='/sale-webclient/sales', 
                auth= 'public',
                type= 'http',
                methods= ['get'])
    def get_sales(self,   
                sale_id=".*", 
                customer_name=".*",
                order_date_after=".*",
                order_date_before=".*",
                maxqueries=5,
                page=1,
                **kw):
        string_fields = {
            "sale_id": sale_id,
            "customer_name": customer_name,
        }
        date_fields = {
            "order_date_after": order_date_after,
            "order_date_before": order_date_before,
        }
        filters = []
        for key in string_fields.keys():
            if string_fields[key]!=".*":
                string_fields[key] = f".*{string_fields[key].lower()}.*"
        for key in date_fields.keys():
            if date_fields[key]!=".*":
                try:
                    date_fields[key] = datetime.datetime.fromisoformat(date_fields[key])
                except:
                    return json.dumps({"error": f"{key} is not a valid date format"})
                if key=="order_date_before":
                    filters.append(
                        ("date_order", "<=", date_fields[key])
                    )
                else:
                    filters.append(
                        ("date_order", ">=", date_fields[key])
                    )

        sales = request.env["sale.order"].search(filters)
        #PAGINATION
        available_pages = math.ceil(len(sales)/maxqueries)
        sale_list = []
        query_count = 0
        for index, sale in enumerate(sales):
            if index < ((int(page)-1)*maxqueries):
                continue
            processed_keys = {}
            for key in string_fields.keys():  
                if key == "sale_id":
                    processed_keys[f"{key}_processed"] = self.process_names(sale.name)
                    if not self.compare_processed(string_fields[key], processed_keys[f"{key}_processed"]):
                        break
                elif key == "customer_name":
                    processed_keys[f"{key}_processed"] = self.process_names(sale.partner_id.name)
                    if not self.compare_processed(string_fields[key], processed_keys[f"{key}_processed"]):
                        break
                    else:
                        sale_list.append({
                            "id": sale.id,
                            "name": sale.name,
                            "customer_name": sale.partner_id.name,
                            "order_date": sale.date_order.strftime("%d/%m/%y %H:%M:%S")
                        })
                        query_count +=1

            if query_count==maxqueries:
                break 

        return json.dumps({
            "sales": sale_list,
            "pages": available_pages
        }) 

    @http.route('/sale-webclient/edit-sale', 
                auth='public', 
                website=True)
    def edit_sale(self, **kw):
        return http.request.render('sale-webclient.EditSaleTemplate')

    @http.route(route='/sale-webclient/sale', 
                auth= 'public',
                type= 'http',
                methods= ['get', 'patch'])
    def get_sale_by_id(self, 
                       id=None, 
                       **kw):
        method = request.httprequest.method

        if method == "GET":
            if not id:
                return json.dumps({"error": "Sale id doesn't exists"})
            sale = request.env["sale.order"].search([
                ("name", "=", id)
            ])
            if len(sale)!=1:
                return json.dumps({"error": "Sale id doesn't exists"})
            sale_lines=[]
            sale = sale[0]
            for line in sale.order_line:
                sale_lines.append({
                    "product": line.product_template_id.name,
                    "quantity": line.product_uom_qty,
                    "unit_price": line.price_unit
                })

            return json.dumps({
                "id": sale.id,
                "name": sale.name,
                "customer_name": sale.partner_id.name,
                "order_date": sale.date_order.strftime("%d/%m/%y %H:%M:%S"),
                "products": sale_lines
            })
