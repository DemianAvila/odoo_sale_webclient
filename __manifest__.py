# -*- coding: utf-8 -*-
{
    'name': "Sale in webclient",
    'summary': "Allows for a platform user to do sales",
    'description': """
Habilitates a CRUD for the platform user to access the sale model
    """,
    'author': "Demian Avila - demianavilar@gmail.com",
    'website': "Aliadoo",
    'category': 'Sales',
    'version': '0.1',
    'depends': [
        'base', 
        'web', 
        'sale_management',
        'website'
    ],
    'data': [
        'views/sale-list-template.xml',
        'views/edit-sale-template.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'sale-webclient/static/src/salelist-component/**/*',
            'sale-webclient/static/src/editsale-component/**/*',
        ],
    },
}

