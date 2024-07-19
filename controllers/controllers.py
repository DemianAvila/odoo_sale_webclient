#-*- coding: utf-8 -*-
import json
import re
from odoo import http
from odoo.http import request
import logging


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
    def index(self, namesearch=".*", maxqueries=5, **kw):
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


