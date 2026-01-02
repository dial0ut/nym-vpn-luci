'use strict';
'require baseclass';
'require rpc';

return baseclass.extend({
    status: rpc.declare({
        object: 'nym-vpn',
        method: 'status',
        params: []
    }),

    connect: rpc.declare({
        object: 'nym-vpn',
        method: 'connect',
        params: []
    }),

    disconnect: rpc.declare({
        object: 'nym-vpn',
        method: 'disconnect',
        params: []
    }),

    info: rpc.declare({
        object: 'nym-vpn',
        method: 'info',
        params: []
    }),

    gatewayGet: rpc.declare({
        object: 'nym-vpn',
        method: 'gateway_get',
        params: []
    }),

    gatewaySet: rpc.declare({
        object: 'nym-vpn',
        method: 'gateway_set',
        params: ['entry_country', 'exit_country', 'entry_id', 'exit_id', 'entry_random', 'exit_random', 'residential_exit']
    }),

    gatewayListCountries: rpc.declare({
        object: 'nym-vpn',
        method: 'gateway_list_countries',
        params: ['gateway_type']
    }),

    gatewayListByCountry: rpc.declare({
        object: 'nym-vpn',
        method: 'gateway_list_by_country',
        params: ['gateway_type', 'country_code']
    }),

    tunnelGet: rpc.declare({
        object: 'nym-vpn',
        method: 'tunnel_get',
        params: []
    }),

    tunnelSet: rpc.declare({
        object: 'nym-vpn',
        method: 'tunnel_set',
        params: ['ipv6', 'two_hop']
    }),

    accountGet: rpc.declare({
        object: 'nym-vpn',
        method: 'account_get',
        params: []
    }),

    accountSet: rpc.declare({
        object: 'nym-vpn',
        method: 'account_set',
        params: ['mnemonic', 'mode']
    }),

    accountForget: rpc.declare({
        object: 'nym-vpn',
        method: 'account_forget',
        params: []
    }),

    accountRotateKeys: rpc.declare({
        object: 'nym-vpn',
        method: 'account_rotate_keys',
        params: []
    }),

    networkGet: rpc.declare({
        object: 'nym-vpn',
        method: 'network_get',
        params: []
    }),

    dnsGet: rpc.declare({
        object: 'nym-vpn',
        method: 'dns_get',
        params: []
    }),

    dnsSet: rpc.declare({
        object: 'nym-vpn',
        method: 'dns_set',
        params: ['servers']
    }),

    dnsEnable: rpc.declare({
        object: 'nym-vpn',
        method: 'dns_enable',
        params: []
    }),

    dnsDisable: rpc.declare({
        object: 'nym-vpn',
        method: 'dns_disable',
        params: []
    }),

    dnsGetDefault: rpc.declare({
        object: 'nym-vpn',
        method: 'dns_get_default',
        params: []
    }),

    daemonStatus: rpc.declare({
        object: 'nym-vpn',
        method: 'daemon_status',
        params: []
    }),

    daemonRestart: rpc.declare({
        object: 'nym-vpn',
        method: 'daemon_restart',
        params: []
    })
});
