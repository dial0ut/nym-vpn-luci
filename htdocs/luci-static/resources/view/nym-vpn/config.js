'use strict';
'require view';
'require rpc';
'require ui';
'require poll';
'require dom';

// Country code to name mapping
var countryNames = {
    'AE': 'United Arab Emirates', 'AL': 'Albania', 'AM': 'Armenia', 'AR': 'Argentina',
    'AT': 'Austria', 'AU': 'Australia', 'BE': 'Belgium', 'BG': 'Bulgaria', 'BH': 'Bahrain',
    'BO': 'Bolivia', 'BR': 'Brazil', 'CA': 'Canada', 'CH': 'Switzerland', 'CL': 'Chile',
    'CO': 'Colombia', 'CR': 'Costa Rica', 'CY': 'Cyprus', 'CZ': 'Czech Republic',
    'DE': 'Germany', 'EC': 'Ecuador', 'EE': 'Estonia', 'ES': 'Spain', 'FI': 'Finland',
    'FR': 'France', 'GB': 'United Kingdom', 'GR': 'Greece', 'GT': 'Guatemala', 'HK': 'Hong Kong',
    'HR': 'Croatia', 'HU': 'Hungary', 'ID': 'Indonesia', 'IE': 'Ireland', 'IL': 'Israel',
    'IN': 'India', 'IS': 'Iceland', 'IT': 'Italy', 'JP': 'Japan', 'KH': 'Cambodia',
    'KR': 'South Korea', 'LT': 'Lithuania', 'LV': 'Latvia', 'MD': 'Moldova', 'MK': 'North Macedonia',
    'MX': 'Mexico', 'MY': 'Malaysia', 'NG': 'Nigeria', 'NL': 'Netherlands', 'NO': 'Norway',
    'NZ': 'New Zealand', 'PE': 'Peru', 'PK': 'Pakistan', 'PL': 'Poland', 'PT': 'Portugal',
    'RO': 'Romania', 'RS': 'Serbia', 'RU': 'Russia', 'SE': 'Sweden', 'SG': 'Singapore',
    'SI': 'Slovenia', 'SK': 'Slovakia', 'TR': 'Turkey', 'TW': 'Taiwan', 'UA': 'Ukraine',
    'US': 'United States', 'VN': 'Vietnam', 'ZA': 'South Africa'
};

var callStatus = rpc.declare({
    object: 'nym-vpn',
    method: 'status',
    params: []
});

var callConnect = rpc.declare({
    object: 'nym-vpn',
    method: 'connect',
    params: []
});

var callDisconnect = rpc.declare({
    object: 'nym-vpn',
    method: 'disconnect',
    params: []
});

var callInfo = rpc.declare({
    object: 'nym-vpn',
    method: 'info',
    params: []
});

var callGatewayGet = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_get',
    params: []
});

var callGatewaySet = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_set',
    params: ['entry_country', 'exit_country', 'entry_id', 'exit_id', 'entry_random', 'exit_random', 'residential_exit']
});

var callGatewayListCountries = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_list_countries',
    params: ['gateway_type']
});

var callGatewayListByCountry = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_list_by_country',
    params: ['gateway_type', 'country_code']
});

var callTunnelGet = rpc.declare({
    object: 'nym-vpn',
    method: 'tunnel_get',
    params: []
});

var callTunnelSet = rpc.declare({
    object: 'nym-vpn',
    method: 'tunnel_set',
    params: ['ipv6', 'two_hop']
});

var callAccountGet = rpc.declare({
    object: 'nym-vpn',
    method: 'account_get',
    params: []
});

var callAccountSet = rpc.declare({
    object: 'nym-vpn',
    method: 'account_set',
    params: ['mnemonic', 'mode']
});

var callAccountForget = rpc.declare({
    object: 'nym-vpn',
    method: 'account_forget',
    params: []
});

var callAccountRotateKeys = rpc.declare({
    object: 'nym-vpn',
    method: 'account_rotate_keys',
    params: []
});

var callNetworkGet = rpc.declare({
    object: 'nym-vpn',
    method: 'network_get',
    params: []
});

var callLanGet = rpc.declare({
    object: 'nym-vpn',
    method: 'lan_get',
    params: []
});

var callLanSet = rpc.declare({
    object: 'nym-vpn',
    method: 'lan_set',
    params: ['policy']
});

return view.extend({
    load: function() {
        return Promise.all([
            callStatus(),
            callInfo(),
            callGatewayGet(),
            callGatewayListCountries('mixnet-entry'),
            callGatewayListCountries('mixnet-exit'),
            callTunnelGet(),
            callAccountGet(),
            callNetworkGet(),
            callLanGet()
        ]).catch(function(err) {
            ui.addNotification(null, E('p', {}, 'Failed to load Nym VPN data: ' + err.message));
            return [null, null, null, [], [], null, null, null, null];
        });
    },

    render: function(data) {
        var status = data[0] || {};
        var info = data[1] || {};
        var gateway_config = data[2] || {};
        var entry_countries = (data[3] && data[3].countries) || [];
        var exit_countries = (data[4] && data[4].countries) || [];
        var tunnel_config = data[5] || {};
        var account_info = data[6] || {};
        var network = data[7] || {};
        var lan_policy = data[8] || {};

        var view = this;
        var statusSection;
        var statusText;
        var connectBtn;
        var disconnectBtn;

        // Gateway selection elements
        var entryGatewaySelectContainer;
        var exitGatewaySelectContainer;
        var entryCountrySelectContainer;
        var exitCountrySelectContainer;
        var gatewayInfoText;

        var updateGatewayDisplay = function() {
            return Promise.all([
                callGatewayGet(),
                callStatus()
            ]).then(function(results) {
                var config = results[0] || {};
                var status = results[1] || {};

                var entryDisplay = document.getElementById('current-entry-display');
                var exitDisplay = document.getElementById('current-exit-display');

                // If connected, show actual connected gateways; otherwise show "Not connected"
                if (status.state === 'connected' && status.entry_gateway) {
                    if (entryDisplay) {
                        entryDisplay.textContent = status.entry_gateway;
                    }
                    if (exitDisplay) {
                        exitDisplay.textContent = status.exit_gateway || 'Unknown';
                    }
                } else {
                    if (entryDisplay) {
                        entryDisplay.textContent = 'Not connected';
                    }
                    if (exitDisplay) {
                        exitDisplay.textContent = 'Not connected';
                    }
                }
            }).catch(function(err) {
                console.error('Gateway display update failed:', err);
            });
        };

        var updateStatus = L.bind(function() {
            return callStatus().then(function(result) {
                if (!result) return;

                var state = result.state || 'unknown';
                var color = 'gray';
                var displayState = state;

                if (state === 'connected') {
                    color = 'green';
                    displayState = 'Connected';
                } else if (state === 'disconnected') {
                    color = 'red';
                    displayState = 'Disconnected';
                } else if (state === 'connecting') {
                    color = 'orange';
                    displayState = 'Connecting...';
                } else if (state === 'disconnecting') {
                    color = 'orange';
                    displayState = 'Disconnecting...';
                }

                if (statusText) {
                    statusText.innerHTML = '<span style="font-weight:bold;color:' + color + '">' + displayState + '</span>';
                }

                if (connectBtn && disconnectBtn) {
                    if (state === 'connected' || state === 'connecting') {
                        connectBtn.disabled = true;
                        disconnectBtn.disabled = false;
                    } else {
                        connectBtn.disabled = false;
                        disconnectBtn.disabled = true;
                    }
                }

            }).catch(function(err) {
                console.error('Status update failed:', err);
            });
        }, this);

        var handleConnect = L.bind(function() {
            var modalContent = E('p', { 'class': 'spinning' }, _('Establishing VPN connection...'));
            ui.showModal(_('Connecting'), [modalContent]);

            // Start connection
            callConnect().then(function(result) {
                if (!result || !result.success) {
                    ui.hideModal();
                    ui.addNotification(null, E('p', {}, _('Connection failed: ') + (result.error || 'Unknown error')), 'error');
                    return;
                }

                // Poll status every second until connected
                var pollCount = 0;
                var maxPolls = 60; // Max 60 seconds

                var pollStatus = function() {
                    pollCount++;
                    callStatus().then(function(status) {
                        if (status && status.state === 'connected') {
                            // Show success in modal
                            modalContent.className = '';
                            var msg = _('Connected successfully');
                            if (status.mode === 'wireguard') {
                                msg += ' (2-hop WireGuard)';
                            } else {
                                msg += ' (5-hop Mixnet)';
                            }
                            if (status.entry_gateway) {
                                msg += '\nEntry: ' + status.entry_gateway;
                            }
                            if (status.exit_gateway) {
                                msg += '\nExit: ' + status.exit_gateway;
                            }
                            modalContent.textContent = msg;
                            modalContent.style.whiteSpace = 'pre-line';
                            setTimeout(function() {
                                ui.hideModal();
                                updateStatus();
                                updateGatewayDisplay();
                            }, 2000);
                        } else if (status && status.state === 'connecting') {
                            // Update modal with progress
                            var progressMsg = _('Connecting...');
                            if (status.raw_state) {
                                progressMsg = status.raw_state.replace('State: ', '');
                            }
                            modalContent.textContent = progressMsg;

                            if (pollCount < maxPolls) {
                                setTimeout(pollStatus, 1000);
                            } else {
                                modalContent.className = '';
                                modalContent.textContent = _('Connection timeout - still connecting in background');
                                setTimeout(function() { ui.hideModal(); }, 2000);
                            }
                        } else if (status && status.state === 'disconnected') {
                            modalContent.className = '';
                            modalContent.textContent = _('Connection failed - disconnected');
                            setTimeout(function() {
                                ui.hideModal();
                                updateStatus();
                            }, 2000);
                        } else {
                            // Unknown state, keep polling
                            if (pollCount < maxPolls) {
                                setTimeout(pollStatus, 1000);
                            } else {
                                ui.hideModal();
                                updateStatus();
                            }
                        }
                    }).catch(function(err) {
                        if (pollCount < maxPolls) {
                            setTimeout(pollStatus, 1000);
                        } else {
                            modalContent.className = '';
                            modalContent.textContent = _('Status check error: ') + err.message;
                            setTimeout(function() { ui.hideModal(); }, 2000);
                        }
                    });
                };

                // Start polling after a brief delay
                setTimeout(pollStatus, 1000);

            }).catch(function(err) {
                ui.hideModal();
                ui.addNotification(null, E('p', {}, _('Connection error: ') + err.message), 'error');
            });
        }, this);

        var handleDisconnect = L.bind(function() {
            return callDisconnect().then(function(result) {
                if (result && result.success) {
                    ui.addNotification(null, E('p', {}, _('Disconnected successfully')));
                    updateStatus();
                    updateGatewayDisplay();
                } else {
                    ui.addNotification(null, E('p', {}, _('Disconnect failed: ') + (result.error || 'Unknown error')), 'error');
                }
            }).catch(function(err) {
                ui.addNotification(null, E('p', {}, _('Disconnect error: ') + err.message), 'error');
            });
        }, this);

        // Load gateways when country is selected
        var loadGatewaysForCountry = L.bind(function(country, type, container) {
            if (!country || country === 'none') {
                dom.content(container, E('p', { 'style': 'font-style: italic; opacity: 0.7' },
                    _('Select a country to see available gateways')));
                return;
            }

            if (country === 'random') {
                dom.content(container, E('p', { 'style': 'font-style: italic; opacity: 0.7' },
                    _('Random gateway will be selected automatically')));
                return;
            }

            dom.content(container, E('p', { 'class': 'spinning' }, _('Loading gateways...')));

            return callGatewayListByCountry(type, country).then(function(result) {
                if (!result || !result.gateways || result.gateways.length === 0) {
                    dom.content(container, E('p', { 'style': 'color: #999' },
                        _('No gateways found for this country')));
                    return;
                }

                // Sort gateways: High -> Medium -> Low -> Offline
                var sortedGateways = result.gateways.slice().sort(function(a, b) {
                    var perfA = (a.performance || '').toLowerCase();
                    var perfB = (b.performance || '').toLowerCase();

                    var scoreA = perfA.indexOf('offline') >= 0 ? 0 :
                                 perfA.indexOf('low') >= 0 ? 1 :
                                 perfA.indexOf('medium') >= 0 ? 2 :
                                 perfA.indexOf('high') >= 0 ? 3 : 1;

                    var scoreB = perfB.indexOf('offline') >= 0 ? 0 :
                                 perfB.indexOf('low') >= 0 ? 1 :
                                 perfB.indexOf('medium') >= 0 ? 2 :
                                 perfB.indexOf('high') >= 0 ? 3 : 1;

                    return scoreB - scoreA; // Higher score first
                });

                var options = [E('option', { 'value': '' }, '-- Any Gateway (Random) --')];

                sortedGateways.forEach(function(gw) {
                    // Safe access to properties with defaults
                    var perf = gw.performance || '';
                    var gwName = gw.name || 'Unknown';
                    var gwLocation = gw.location || '';
                    var gwId = gw.id || '';

                    // Format: "🟢 gateway-name - Performance"
                    var perfIcon = perf.indexOf('High') >= 0 ? '🟢' :
                                   perf.indexOf('Medium') >= 0 ? '🟡' :
                                   perf.indexOf('Offline') >= 0 ? '⚫' : '🔴';

                    var label = perfIcon + ' ' + gwName.substring(0, 40);
                    if (perf) {
                        label += ' - ' + perf.substring(0, 35);
                    }

                    var title = gwLocation;
                    if (perf) {
                        title += ' | ' + perf;
                    }

                    options.push(E('option', { 'value': gwId, 'title': title }, label));
                });

                var select = E('select', {
                    'class': 'cbi-input-select',
                    'name': type === 'mixnet-entry' ? 'entry_gateway_id' : 'exit_gateway_id',
                    'style': 'width: 100%; max-width: 600px'
                }, options);

                dom.content(container, [
                    E('div', { 'style': 'margin-top: 10px' }, [
                        E('label', { 'style': 'font-weight: bold' },
                            _(type === 'mixnet-entry' ? 'Select Entry Gateway:' : 'Select Exit Gateway:')),
                        E('div', { 'style': 'margin-top: 5px' }, select),
                        E('div', { 'style': 'margin-top: 5px; font-size: 0.9em; opacity: 0.7' },
                            _('Found ') + result.gateways.length + _(' gateways. Leave blank for random selection.'))
                    ])
                ]);
            }).catch(function(err) {
                dom.content(container, E('p', { 'style': 'color: red' },
                    _('Error loading gateways: ') + err.message));
            });
        }, this);

        var handleGatewayUpdate = L.bind(function(ev) {
            ev.preventDefault();

            var formData = new FormData(ev.target);
            var entry_country = formData.get('entry_country');
            var exit_country = formData.get('exit_country');
            var entry_gateway_id = formData.get('entry_gateway_id');
            var exit_gateway_id = formData.get('exit_gateway_id');
            var residential_exit = formData.get('residential_exit');

            // Clean up values
            if (entry_country === 'none') entry_country = null;
            if (exit_country === 'none') exit_country = null;
            if (entry_country === 'random') {
                entry_country = null;
                entry_gateway_id = null;
            }
            if (exit_country === 'random') {
                exit_country = null;
                exit_gateway_id = null;
            }

            // If specific gateway selected, clear country (ID takes precedence)
            if (entry_gateway_id) entry_country = null;
            if (exit_gateway_id) exit_country = null;

            return callGatewaySet(
                entry_country,
                exit_country,
                entry_gateway_id || null,
                exit_gateway_id || null,
                false, // entry_random
                false, // exit_random
                residential_exit || null
            ).then(function(result) {
                if (result && result.success) {
                    ui.addNotification(null, E('p', {}, _('Gateway configuration updated')));
                } else {
                    ui.addNotification(null, E('p', {}, _('Update failed: ') + (result.error || 'Unknown error')), 'error');
                }
            }).catch(function(err) {
                ui.addNotification(null, E('p', {}, _('Update error: ') + err.message), 'error');
            });
        }, this);

        var handleTunnelUpdate = L.bind(function(ev) {
            ev.preventDefault();

            var ipv6Checkbox = ev.target.querySelector('#ipv6-toggle');
            var twoHopCheckbox = ev.target.querySelector('#two-hop-toggle');

            var ipv6 = ipv6Checkbox && ipv6Checkbox.checked ? 'on' : 'off';
            var two_hop = twoHopCheckbox && twoHopCheckbox.checked ? 'on' : 'off';

            return callTunnelSet(ipv6, two_hop).then(function(result) {
                if (result && result.success) {
                    ui.addNotification(null, E('p', {}, _('Tunnel configuration updated')));
                    // Update display values
                    var ipv6Display = document.getElementById('tunnel-ipv6-display');
                    var twoHopDisplay = document.getElementById('tunnel-twohop-display');
                    if (ipv6Display) ipv6Display.textContent = ipv6;
                    if (twoHopDisplay) twoHopDisplay.textContent = two_hop;
                } else {
                    ui.addNotification(null, E('p', {}, _('Update failed: ') + (result.error || 'Unknown error')), 'error');
                }
            }).catch(function(err) {
                ui.addNotification(null, E('p', {}, _('Update error: ') + err.message), 'error');
            });
        }, this);

        var handleAccountLogin = L.bind(function(ev) {
            ev.preventDefault();

            var formData = new FormData(ev.target);
            var mnemonic = formData.get('mnemonic');
            var mode = formData.get('mode') || 'api';

            if (!mnemonic) {
                ui.addNotification(null, E('p', {}, _('Mnemonic is required')), 'error');
                return;
            }

            ui.showModal(_('Logging in'), [
                E('p', { 'class': 'spinning' }, _('Setting up account...'))
            ]);

            return callAccountSet(mnemonic, mode).then(function(result) {
                ui.hideModal();
                if (result && result.success) {
                    ui.addNotification(null, E('p', {}, _('Account set successfully. Refreshing...')));
                    setTimeout(function() { location.reload(); }, 1000);
                } else {
                    ui.addNotification(null, E('p', {}, _('Login failed: ') + (result.error || 'Unknown error')), 'error');
                }
            }).catch(function(err) {
                ui.hideModal();
                ui.addNotification(null, E('p', {}, _('Login error: ') + err.message), 'error');
            });
        }, this);

        var handleAccountLogout = L.bind(function() {
            ui.showModal(_('Confirm Logout'), [
                E('p', {}, _('Are you sure you want to forget this account? You will need to re-enter your mnemonic to connect again.')),
                E('div', { 'class': 'right' }, [
                    E('button', {
                        'class': 'btn',
                        'click': ui.hideModal
                    }, _('Cancel')),
                    ' ',
                    E('button', {
                        'class': 'btn cbi-button-negative',
                        'click': function() {
                            ui.hideModal();
                            ui.showModal(_('Logging out'), [
                                E('p', { 'class': 'spinning' }, _('Forgetting account...'))
                            ]);

                            callAccountForget().then(function(result) {
                                ui.hideModal();
                                if (result && result.success) {
                                    ui.addNotification(null, E('p', {}, _('Account forgotten. Refreshing...')));
                                    setTimeout(function() { location.reload(); }, 1000);
                                } else {
                                    ui.addNotification(null, E('p', {}, _('Logout failed: ') + (result.error || 'Unknown error')), 'error');
                                }
                            }).catch(function(err) {
                                ui.hideModal();
                                ui.addNotification(null, E('p', {}, _('Logout error: ') + err.message), 'error');
                            });
                        }
                    }, _('Logout'))
                ])
            ]);
        }, this);

        var handleRotateKeys = L.bind(function() {
            // First check if connected
            callStatus().then(function(status) {
                if (status && (status.state === 'connected' || status.state === 'connecting')) {
                    ui.showModal(_('Cannot Rotate Keys'), [
                        E('p', {}, _('You must disconnect from the VPN before rotating keys.')),
                        E('div', { 'class': 'right' }, [
                            E('button', {
                                'class': 'btn cbi-button-action',
                                'click': ui.hideModal
                            }, _('OK'))
                        ])
                    ]);
                    return;
                }

                ui.showModal(_('Rotating Keys'), [
                    E('p', { 'class': 'spinning' }, _('Rotating WireGuard keys...'))
                ]);

                callAccountRotateKeys().then(function(result) {
                    ui.hideModal();
                    if (result && result.success) {
                        ui.addNotification(null, E('p', {}, _('Keys rotated successfully')));
                    } else {
                        ui.addNotification(null, E('p', {}, _('Key rotation failed: ') + (result.error || 'Unknown error')), 'error');
                    }
                }).catch(function(err) {
                    ui.hideModal();
                    ui.addNotification(null, E('p', {}, _('Key rotation error: ') + err.message), 'error');
                });
            });
        }, this);

        var handleLanPolicy = L.bind(function(policy) {
            return callLanSet(policy).then(function(result) {
                if (result && result.success) {
                    ui.addNotification(null, E('p', {}, _('LAN policy updated to: ') + policy));
                } else {
                    ui.addNotification(null, E('p', {}, _('Update failed: ') + (result.error || 'Unknown error')), 'error');
                }
            }).catch(function(err) {
                ui.addNotification(null, E('p', {}, _('Update error: ') + err.message), 'error');
            });
        }, this);

        // Helper function to create country dropdown
        var createCountrySelect = function(countries, name, label, gatewayType, container) {
            var options = [E('option', { 'value': 'none' }, '-- Select Country --')];

            countries.forEach(function(country) {
                var countryName = countryNames[country.code] || country.code;
                var label = countryName + ' (' + country.code + ') - ' + country.count + ' gateways';
                options.push(E('option', { 'value': country.code }, label));
            });

            options.push(E('option', { 'value': 'random' }, '🎲 Random Country'));

            var select = E('select', {
                'name': name,
                'class': 'cbi-input-select',
                'change': function(ev) {
                    loadGatewaysForCountry(ev.target.value, gatewayType, container);
                }
            }, options);

            return E('div', { 'class': 'cbi-value' }, [
                E('label', { 'class': 'cbi-value-title' }, _(label)),
                E('div', { 'class': 'cbi-value-field' }, select)
            ]);
        };

        // Refresh gateways function
        var refreshGateways = L.bind(function(btn) {
            console.log('Refresh gateways clicked');
            if (btn) {
                btn.disabled = true;
                btn.textContent = _('Refreshing...');
            }

            return Promise.all([
                callGatewayListCountries('mixnet-entry'),
                callGatewayListCountries('mixnet-exit')
            ]).then(function(results) {
                console.log('Gateway refresh results:', results);
                var entry_countries = (results[0] && results[0].countries) || [];
                var exit_countries = (results[1] && results[1].countries) || [];
                console.log('Entry countries:', entry_countries.length, 'Exit countries:', exit_countries.length);

                // Update info text
                if (gatewayInfoText) {
                    console.log('Updating gateway info text');
                    dom.content(gatewayInfoText, [
                        _('Choose entry and exit gateways. You can select by country or pick specific gateways.'),
                        E('br'),
                        _('Available: ') + entry_countries.length + _(' entry countries, ') + exit_countries.length + _(' exit countries')
                    ]);
                }

                // Rebuild entry country dropdown
                if (entryCountrySelectContainer) {
                    console.log('Rebuilding entry country dropdown');
                    dom.content(entryCountrySelectContainer,
                        createCountrySelect(entry_countries, 'entry_country', 'Country:', 'mixnet-entry', entryGatewaySelectContainer)
                    );
                } else {
                    console.warn('entryCountrySelectContainer not found');
                }

                // Rebuild exit country dropdown
                if (exitCountrySelectContainer) {
                    console.log('Rebuilding exit country dropdown');
                    dom.content(exitCountrySelectContainer,
                        createCountrySelect(exit_countries, 'exit_country', 'Country:', 'mixnet-exit', exitGatewaySelectContainer)
                    );
                } else {
                    console.warn('exitCountrySelectContainer not found');
                }

                // Reset gateway containers
                if (entryGatewaySelectContainer) {
                    console.log('Resetting entry gateway container');
                    dom.content(entryGatewaySelectContainer, [
                        E('p', { 'style': 'font-style: italic; opacity: 0.7' }, _('Select a country to see available gateways'))
                    ]);
                }
                if (exitGatewaySelectContainer) {
                    console.log('Resetting exit gateway container');
                    dom.content(exitGatewaySelectContainer, [
                        E('p', { 'style': 'font-style: italic; opacity: 0.7' }, _('Select a country to see available gateways'))
                    ]);
                }

                if (btn) {
                    btn.disabled = false;
                    btn.textContent = _('Refresh Gateways');
                }

                console.log('Gateway refresh complete');
                ui.addNotification(null, E('p', {}, _('Gateway list refreshed successfully')), 'info');
            }).catch(function(err) {
                console.error('Gateway refresh error:', err);
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = _('Refresh Gateways');
                }
                ui.addNotification(null, E('p', {}, _('Failed to refresh gateways: ') + err.message), 'error');
            });
        }, this);

        // Build UI
        var m = E('div', { 'class': 'cbi-map' }, [
            E('style', {}, `
                .cbi-map .btn.cbi-button.btn-green,
                .cbi-map .btn.cbi-button.btn-green:link,
                .cbi-map .btn.cbi-button.btn-green:visited {
                    background-color: #5cb85c !important;
                    border-color: #4cae4c !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-green:hover,
                .cbi-map .btn.cbi-button.btn-green:focus {
                    background-color: #449d44 !important;
                    border-color: #398439 !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-green:active {
                    background-color: #398439 !important;
                    border-color: #255625 !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-red,
                .cbi-map .btn.cbi-button.btn-red:link,
                .cbi-map .btn.cbi-button.btn-red:visited {
                    background-color: #d9534f !important;
                    border-color: #d43f3a !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-red:hover,
                .cbi-map .btn.cbi-button.btn-red:focus {
                    background-color: #c9302c !important;
                    border-color: #ac2925 !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-red:active {
                    background-color: #ac2925 !important;
                    border-color: #761c19 !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-blue,
                .cbi-map .btn.cbi-button.btn-blue:link,
                .cbi-map .btn.cbi-button.btn-blue:visited {
                    background-color: #5bc0de !important;
                    border-color: #46b8da !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-blue:hover,
                .cbi-map .btn.cbi-button.btn-blue:focus {
                    background-color: #31b0d5 !important;
                    border-color: #269abc !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .cbi-map .btn.cbi-button.btn-blue:active {
                    background-color: #269abc !important;
                    border-color: #1b6d85 !important;
                    color: white !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
            `),
            E('h2', {}, _('Nym VPN')),
            E('div', { 'class': 'cbi-map-descr' },
                _('Privacy-focused VPN powered by the Nym mixnet'))
        ]);

        // Status Section
        statusSection = E('div', { 'class': 'cbi-section' }, [
            E('h3', {}, _('Connection Status')),
            E('div', { 'class': 'cbi-section-node' }, [
                E('div', { 'class': 'table' }, [
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left', 'style': 'width:33%' }, _('Status:')),
                        E('div', { 'class': 'td left' }, [
                            statusText = E('span', { 'id': 'vpn-status' }, _('Loading...'))
                        ])
                    ]),
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left' }, _('Version:')),
                        E('div', { 'class': 'td left' }, info.version || 'Unknown')
                    ]),
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left' }, _('Network:')),
                        E('div', { 'class': 'td left' }, network.network || info.network || 'Unknown')
                    ])
                ]),
                E('div', { 'class': 'cbi-section-node', 'style': 'margin-top: 10px' }, [
                    connectBtn = E('button', {
                        'class': 'btn cbi-button btn-green',
                        'click': handleConnect
                    }, _('Connect')),
                    ' ',
                    disconnectBtn = E('button', {
                        'class': 'btn cbi-button btn-red',
                        'click': handleDisconnect
                    }, _('Disconnect'))
                ])
            ])
        ]);

        // Account Section
        var isLoggedIn = account_info.identity && account_info.identity !== 'Not set' && account_info.identity !== '';

        var accountSection = E('div', { 'class': 'cbi-section' }, [
            E('h3', {}, _('Account')),
            E('div', { 'class': 'cbi-section-node' }, [
                E('div', { 'class': 'table' }, [
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left', 'style': 'width:33%' }, _('Account ID:')),
                        E('div', { 'class': 'td left' }, [
                            E('span', { 'id': 'account-identity' }, account_info.identity || 'Not set')
                        ])
                    ]),
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left' }, _('Account State:')),
                        E('div', { 'class': 'td left' }, [
                            E('span', { 'id': 'account-state' }, account_info.state || 'Unknown')
                        ])
                    ])
                ]),
                isLoggedIn ? E('div', { 'class': 'cbi-section-node', 'style': 'margin-top: 15px' }, [
                    E('button', {
                        'class': 'btn cbi-button btn-blue',
                        'click': handleRotateKeys
                    }, _('Rotate Keys')),
                    ' ',
                    E('button', {
                        'class': 'btn cbi-button btn-red',
                        'click': handleAccountLogout
                    }, _('Logout'))
                ]) : E('form', { 'submit': handleAccountLogin }, [
                    E('div', { 'class': 'cbi-value' }, [
                        E('label', { 'class': 'cbi-value-title' }, _('Mnemonic:')),
                        E('div', { 'class': 'cbi-value-field' }, [
                            E('input', {
                                'type': 'password',
                                'name': 'mnemonic',
                                'class': 'cbi-input-text',
                                'placeholder': 'Enter your mnemonic phrase'
                            })
                        ])
                    ]),
                    E('div', { 'class': 'cbi-value' }, [
                        E('label', { 'class': 'cbi-value-title' }, _('Mode:')),
                        E('div', { 'class': 'cbi-value-field' }, [
                            E('select', { 'name': 'mode', 'class': 'cbi-input-select' }, [
                                E('option', { 'value': 'api' }, 'API'),
                                E('option', { 'value': 'decentralised' }, 'Decentralised')
                            ])
                        ])
                    ]),
                    E('div', { 'class': 'cbi-section-node', 'style': 'margin-top: 10px' }, [
                        E('button', {
                            'type': 'submit',
                            'class': 'btn cbi-button btn-green'
                        }, _('Login'))
                    ])
                ])
            ])
        ]);

        // Initialize gateway select containers
        entryGatewaySelectContainer = E('div', { 'style': 'padding: 10px; border-radius: 4px; margin-top: 10px' }, [
            E('p', { 'style': 'font-style: italic; opacity: 0.7' }, _('Select a country to see available gateways'))
        ]);

        exitGatewaySelectContainer = E('div', { 'style': 'padding: 10px; border-radius: 4px; margin-top: 10px' }, [
            E('p', { 'style': 'font-style: italic; opacity: 0.7' }, _('Select a country to see available gateways'))
        ]);

        // Gateway Section - Now with improved dropdowns and specific gateway selection
        var gatewaySection = E('div', { 'class': 'cbi-section' }, [
            E('h3', {}, _('Gateway Selection')),
            gatewayInfoText = E('div', { 'class': 'cbi-map-descr' }, [
                _('Choose entry and exit gateways. You can select by country or pick specific gateways.'),
                E('br'),
                _('Available: ') + entry_countries.length + _(' entry countries, ') + exit_countries.length + _(' exit countries')
            ]),
            E('div', { 'class': 'cbi-section-node', 'style': 'margin-bottom: 10px' }, [
                E('button', {
                    'class': 'btn cbi-button btn-blue',
                    'click': function(ev) {
                        ev.preventDefault();
                        refreshGateways(ev.target);
                    }
                }, _('Refresh Gateways'))
            ]),
            E('div', { 'class': 'cbi-section-node' }, [
                E('div', { 'class': 'table' }, [
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left', 'style': 'width:33%' }, _('Current Entry:')),
                        E('div', { 'class': 'td left', 'id': 'current-entry-display' }, gateway_config.entry_point || 'Not set')
                    ]),
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left' }, _('Current Exit:')),
                        E('div', { 'class': 'td left', 'id': 'current-exit-display' }, gateway_config.exit_point || 'Not set')
                    ])
                ]),
                E('form', { 'submit': handleGatewayUpdate, 'style': 'margin-top: 20px' }, [
                    E('fieldset', { 'style': 'border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 4px' }, [
                        E('legend', { 'style': 'font-weight: bold; padding: 0 10px' }, _('Entry Gateway')),
                        entryCountrySelectContainer = E('div', {}, [
                            createCountrySelect(entry_countries, 'entry_country', 'Country:', 'mixnet-entry', entryGatewaySelectContainer)
                        ]),
                        entryGatewaySelectContainer
                    ]),
                    E('fieldset', { 'style': 'border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 4px' }, [
                        E('legend', { 'style': 'font-weight: bold; padding: 0 10px' }, _('Exit Gateway')),
                        exitCountrySelectContainer = E('div', {}, [
                            createCountrySelect(exit_countries, 'exit_country', 'Country:', 'mixnet-exit', exitGatewaySelectContainer)
                        ]),
                        exitGatewaySelectContainer
                    ]),
                    E('div', { 'class': 'cbi-value' }, [
                        E('label', { 'class': 'cbi-value-title' }, _('Residential Exit:')),
                        E('div', { 'class': 'cbi-value-field' }, [
                            E('select', { 'name': 'residential_exit', 'class': 'cbi-input-select' }, [
                                E('option', { 'value': '' }, '-- No change --'),
                                E('option', { 'value': 'on' }, 'On'),
                                E('option', { 'value': 'off' }, 'Off')
                            ])
                        ])
                    ]),
                    E('div', { 'class': 'cbi-section-node', 'style': 'margin-top: 10px' }, [
                        E('button', {
                            'type': 'submit',
                            'class': 'btn cbi-button btn-green'
                        }, _('Update Gateways'))
                    ])
                ])
            ])
        ]);

        // Tunnel Configuration Section
        var tunnelSection = E('div', { 'class': 'cbi-section' }, [
            E('h3', {}, _('Tunnel Configuration')),
            E('style', {}, `
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 36px;
                    height: 18px;
                    vertical-align: middle;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #888;
                    transition: .2s;
                    border-radius: 18px;
                }
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 12px;
                    width: 12px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .2s;
                    border-radius: 50%;
                }
                input:checked + .toggle-slider {
                    background-color: #5cb85c;
                }
                input:checked + .toggle-slider:before {
                    transform: translateX(18px);
                }
            `),
            E('div', { 'class': 'cbi-section-node' }, [
                E('form', { 'submit': handleTunnelUpdate }, [
                    E('div', { 'class': 'table' }, [
                        E('div', { 'class': 'tr' }, [
                            E('div', { 'class': 'td left', 'style': 'width:33%' }, _('IPv6:')),
                            E('div', { 'class': 'td left', 'style': 'width:33%', 'id': 'tunnel-ipv6-display' }, tunnel_config.ipv6 || 'Unknown'),
                            E('div', { 'class': 'td left' }, [
                                E('label', { 'class': 'toggle-switch' }, [
                                    E('input', {
                                        'type': 'checkbox',
                                        'name': 'ipv6',
                                        'id': 'ipv6-toggle',
                                        'value': 'on',
                                        'checked': (tunnel_config.ipv6 === 'on' || tunnel_config.ipv6 === 'true') ? 'checked' : null
                                    }),
                                    E('span', { 'class': 'toggle-slider' })
                                ])
                            ])
                        ]),
                        E('div', { 'class': 'tr' }, [
                            E('div', { 'class': 'td left' }, _('Two-Hop Mode:')),
                            E('div', { 'class': 'td left', 'id': 'tunnel-twohop-display' }, tunnel_config.two_hop || 'Unknown'),
                            E('div', { 'class': 'td left' }, [
                                E('label', { 'class': 'toggle-switch' }, [
                                    E('input', {
                                        'type': 'checkbox',
                                        'name': 'two_hop',
                                        'id': 'two-hop-toggle',
                                        'value': 'on',
                                        'checked': (tunnel_config.two_hop === 'on' || tunnel_config.two_hop === 'true') ? 'checked' : null
                                    }),
                                    E('span', { 'class': 'toggle-slider' })
                                ])
                            ])
                        ]),
                        E('div', { 'class': 'tr' }, [
                            E('div', { 'class': 'td left' }, _('Netstack:')),
                            E('div', { 'class': 'td left' }, tunnel_config.netstack || 'Unknown'),
                            E('div', { 'class': 'td left' }, '')
                        ]),
                        E('div', { 'class': 'tr' }, [
                            E('div', { 'class': 'td left' }, _('Circumvention Transports:')),
                            E('div', { 'class': 'td left' }, tunnel_config.circumvention_transports || 'Unknown'),
                            E('div', { 'class': 'td left' }, '')
                        ])
                    ]),
                    E('div', { 'class': 'cbi-section-node', 'style': 'margin-top: 10px' }, [
                        E('button', {
                            'type': 'submit',
                            'class': 'btn cbi-button btn-green'
                        }, _('Update Tunnel'))
                    ])
                ])
            ])
        ]);

        // LAN Access Section
        var lanSection = E('div', { 'class': 'cbi-section' }, [
            E('h3', {}, _('Local Network Access')),
            E('div', { 'class': 'cbi-section-node' }, [
                E('div', { 'class': 'table' }, [
                    E('div', { 'class': 'tr' }, [
                        E('div', { 'class': 'td left', 'style': 'width:33%' }, _('Current Policy:')),
                        E('div', { 'class': 'td left' }, lan_policy.policy || 'Unknown')
                    ])
                ]),
                E('div', { 'class': 'cbi-section-node', 'style': 'margin-top: 10px' }, [
                    E('button', {
                        'class': 'btn cbi-button btn-green',
                        'click': function() { handleLanPolicy('allow'); }
                    }, _('Allow LAN Access')),
                    ' ',
                    E('button', {
                        'class': 'btn cbi-button btn-red',
                        'click': function() { handleLanPolicy('block'); }
                    }, _('Block LAN Access'))
                ])
            ])
        ]);

        // Add spacing to sections
        statusSection.style.marginBottom = '30px';
        gatewaySection.style.marginBottom = '30px';
        tunnelSection.style.marginBottom = '30px';
        lanSection.style.marginBottom = '30px';

        // Assemble all sections
        m.appendChild(statusSection);
        m.appendChild(gatewaySection);
        m.appendChild(tunnelSection);
        m.appendChild(lanSection);
        m.appendChild(accountSection);

        // Initial status update
        updateStatus();
        updateGatewayDisplay();

        // Poll for status updates every 5 seconds
        poll.add(updateStatus, 5);

        return m;
    },

    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});
