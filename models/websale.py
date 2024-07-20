#-*- coding: utf-8 -*-

from odoo import models, fields, api


class sale_webclient(models.Model):
    _inherit = "sale.order"
    from_webclient = fields.Boolean(default=False)
