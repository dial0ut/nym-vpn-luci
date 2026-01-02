'use strict';
'require baseclass';
'require dom';

return baseclass.extend({
    UPTIME_STORAGE_KEY: 'nym_vpn_connection_start',
    MOBILE_BREAKPOINT: 768,

    // Mobile detection - checks both screen size and touch capability
    isMobile: function() {
        var isNarrow = window.innerWidth <= this.MOBILE_BREAKPOINT;
        var hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        return isNarrow || (hasTouch && window.innerWidth <= 1024);
    },

    // Listen for viewport changes
    onViewportChange: function(callback) {
        var self = this;
        var lastMobile = self.isMobile();

        var checkViewport = function() {
            var nowMobile = self.isMobile();
            if (nowMobile !== lastMobile) {
                lastMobile = nowMobile;
                callback(nowMobile);
            }
        };

        window.addEventListener('resize', checkViewport);
        window.addEventListener('orientationchange', function() {
            setTimeout(checkViewport, 100);
        });

        return function() {
            window.removeEventListener('resize', checkViewport);
        };
    },

    // Create mobile gateway panel with unified tabs
    // Handles both disconnected (selection) and connected (info + browse) states
    createMobileGatewayTabs: function(options) {
        var E = dom.create.bind(dom);
        var self = this;

        var entryCountries = options.entryCountries || [];
        var exitCountries = options.exitCountries || [];
        var countryData = options.countryData || {};
        var getCountryDisplay = options.getCountryDisplay;
        var onCountryChange = options.onCountryChange;
        var onGatewayLoad = options.onGatewayLoad;

        var activeTab = 'entry';
        var isConnected = false;
        var connectedEntry = null;
        var connectedExit = null;
        var browseExpanded = { entry: false, exit: false };

        // References
        var entryTab, exitTab, contentArea;
        var entryContent, exitContent;
        var entrySelectContainer, exitSelectContainer;
        var entryGatewayListContainer, exitGatewayListContainer;
        var entryConnectedInfo, exitConnectedInfo;
        var entryBrowseToggle, exitBrowseToggle;
        var entryBrowseSection, exitBrowseSection;
        var chainContainer, chainLabel, chainRow;
        var dotsSpan, dotsInterval;
        var mobileUptimeContainer, mobileUptimeDisplay;

        // Create country select
        var createCountrySelect = function(countries, name) {
            var opts = [E('option', { 'value': 'none' }, '— Select Country —')];
            opts.push(E('option', { 'value': 'random' }, '🌐 Random'));

            countries.forEach(function(c) {
                var info = getCountryDisplay(c.code);
                opts.push(E('option', { 'value': c.code },
                    info.flag + ' ' + info.name + ' (' + c.count + ')'));
            });

            return E('select', { 'class': 'nym-select', 'name': name }, opts);
        };

        // Build connection chain visualization
        var buildChain = function(hopCount) {
            if (!chainRow) return;
            chainRow.innerHTML = '';

            // Update label
            var textSpan = chainLabel ? chainLabel.querySelector('.text') : null;
            if (textSpan) {
                textSpan.textContent = hopCount === 2 ? 'Fast Mode' : 'Anonymous Mode';
            }

            // Entry node
            chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-node' }));

            if (hopCount === 2) {
                // Two-hop: single long animated line
                chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-line long' }));
            } else {
                // 5-hop mixnet
                for (var i = 0; i < 3; i++) {
                    chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-line' }));
                    chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-node mixnet' }));
                }
                chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-line' }));
            }

            // Exit node
            chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-node' }));
        };

        // Animate dots: . -> .. -> ... -> . -> ...
        var startDotsAnimation = function() {
            if (dotsInterval) clearInterval(dotsInterval);
            var dotCount = 0;
            var updateDots = function() {
                dotCount = (dotCount % 3) + 1;
                if (dotsSpan) dotsSpan.textContent = '.'.repeat(dotCount);
            };
            updateDots();
            dotsInterval = setInterval(updateDots, 400);
        };

        var stopDotsAnimation = function() {
            if (dotsInterval) {
                clearInterval(dotsInterval);
                dotsInterval = null;
            }
            if (dotsSpan) dotsSpan.textContent = '';
        };

        // Render connected gateway info
        var renderConnectedInfo = function(data) {
            if (!data || (!data.name && !data.ip && !data.id)) {
                return E('div', { 'class': 'nym-mobile-connected-empty' }, '—');
            }
            var flag = data.country ? (countryData[data.country] || {}).flag || '🌐' : '🌐';
            return E('div', { 'class': 'nym-mobile-connected-info' }, [
                E('div', { 'class': 'nym-mobile-connected-flag' }, flag),
                E('div', { 'class': 'nym-mobile-connected-details' }, [
                    data.name ? E('div', { 'class': 'nym-mobile-connected-name' }, data.name) : null,
                    data.id ? E('div', { 'class': 'nym-mobile-connected-id' }, data.id) : null,
                    data.ip ? E('div', { 'class': 'nym-mobile-connected-ip' }, data.ip) : null
                ].filter(Boolean))
            ]);
        };

        // Build tab content for a type (entry or exit)
        var buildTabContent = function(type) {
            var countries = type === 'entry' ? entryCountries : exitCountries;
            var selectName = type === 'entry' ? 'entry_country' : 'exit_country';
            var gatewayInputName = type === 'entry' ? 'entry_gateway_id' : 'exit_gateway_id';

            var selectContainer = E('div', { 'class': 'nym-mobile-select-section' });
            var gatewayListContainer = E('div', { 'class': 'nym-mobile-gateway-list-container' },
                E('div', { 'class': 'nym-mobile-gateway-placeholder' }, 'Select a country'));
            var connectedInfoContainer = E('div', { 'class': 'nym-mobile-connected-section' });
            var browseToggleBtn = E('button', { 'class': 'nym-mobile-browse-toggle' }, [
                E('span', {}, 'Browse Gateways'),
                E('span', { 'class': 'nym-mobile-browse-arrow' }, '▼')
            ]);
            var browseSection = E('div', { 'class': 'nym-mobile-browse-section collapsed' });

            // Country select
            var countrySelect = createCountrySelect(countries, selectName);
            countrySelect.addEventListener('change', function(ev) {
                var val = ev.target.value;
                if (onCountryChange) {
                    onCountryChange(type, val, gatewayListContainer, browseSection);
                }
            });

            selectContainer.appendChild(E('label', { 'class': 'nym-mobile-label' }, 'Country'));
            selectContainer.appendChild(countrySelect);

            // Browse toggle
            browseToggleBtn.addEventListener('click', function() {
                browseExpanded[type] = !browseExpanded[type];
                if (browseExpanded[type]) {
                    browseSection.classList.remove('collapsed');
                    browseToggleBtn.classList.add('expanded');
                } else {
                    browseSection.classList.add('collapsed');
                    browseToggleBtn.classList.remove('expanded');
                }
            });

            // Clone select for browse mode
            var browseSelect = createCountrySelect(countries, selectName + '_browse');
            browseSelect.addEventListener('change', function(ev) {
                var val = ev.target.value;
                var browseListContainer = browseSection.querySelector('.nym-mobile-browse-list');
                if (onCountryChange) {
                    onCountryChange(type, val, browseListContainer, null, true);
                }
            });

            browseSection.appendChild(E('label', { 'class': 'nym-mobile-label' }, 'Browse by Country'));
            browseSection.appendChild(browseSelect);
            browseSection.appendChild(E('div', { 'class': 'nym-mobile-browse-list' },
                E('div', { 'class': 'nym-mobile-gateway-placeholder' }, 'Select a country to browse')));

            // Store references
            if (type === 'entry') {
                entrySelectContainer = selectContainer;
                entryGatewayListContainer = gatewayListContainer;
                entryConnectedInfo = connectedInfoContainer;
                entryBrowseToggle = browseToggleBtn;
                entryBrowseSection = browseSection;
            } else {
                exitSelectContainer = selectContainer;
                exitGatewayListContainer = gatewayListContainer;
                exitConnectedInfo = connectedInfoContainer;
                exitBrowseToggle = browseToggleBtn;
                exitBrowseSection = browseSection;
            }

            return E('div', { 'class': 'nym-mobile-tab-content', 'data-type': type }, [
                // Selection mode (shown when disconnected)
                E('div', { 'class': 'nym-mobile-selection-mode' }, [
                    selectContainer,
                    gatewayListContainer
                ]),
                // Connected mode (shown when connected)
                E('div', { 'class': 'nym-mobile-connected-mode' }, [
                    connectedInfoContainer,
                    browseToggleBtn,
                    browseSection
                ])
            ]);
        };

        // Update visibility based on active tab
        var updateTabVisibility = function() {
            if (entryContent) {
                entryContent.style.display = activeTab === 'entry' ? 'block' : 'none';
            }
            if (exitContent) {
                exitContent.style.display = activeTab === 'exit' ? 'block' : 'none';
            }
        };

        // Update mode (connected vs disconnected)
        var updateMode = function() {
            var selectionEls = contentArea.querySelectorAll('.nym-mobile-selection-mode');
            var connectedEls = contentArea.querySelectorAll('.nym-mobile-connected-mode');

            selectionEls.forEach(function(el) {
                el.style.display = isConnected ? 'none' : 'block';
            });
            connectedEls.forEach(function(el) {
                el.style.display = isConnected ? 'block' : 'none';
            });

            // Update connected info
            if (isConnected) {
                if (entryConnectedInfo) {
                    dom.content(entryConnectedInfo, renderConnectedInfo(connectedEntry));
                }
                if (exitConnectedInfo) {
                    dom.content(exitConnectedInfo, renderConnectedInfo(connectedExit));
                }
            }
        };

        // Build the component
        entryTab = E('button', { 'class': 'nym-mobile-tab active' }, [
            E('span', { 'class': 'nym-mobile-tab-icon' }, '▶'),
            'Entry'
        ]);
        exitTab = E('button', { 'class': 'nym-mobile-tab' }, [
            E('span', { 'class': 'nym-mobile-tab-icon' }, '◀'),
            'Exit'
        ]);

        entryTab.addEventListener('click', function() {
            activeTab = 'entry';
            entryTab.classList.add('active');
            exitTab.classList.remove('active');
            updateTabVisibility();
        });

        exitTab.addEventListener('click', function() {
            activeTab = 'exit';
            exitTab.classList.add('active');
            entryTab.classList.remove('active');
            updateTabVisibility();
        });

        entryContent = buildTabContent('entry');
        exitContent = buildTabContent('exit');
        exitContent.style.display = 'none';

        contentArea = E('div', { 'class': 'nym-mobile-tab-body' }, [entryContent, exitContent]);

        // Mobile uptime display (shown when connected)
        mobileUptimeDisplay = E('div', { 'class': 'nym-mobile-uptime-value' }, '00:00:00');
        mobileUptimeContainer = E('div', { 'class': 'nym-mobile-uptime' }, [
            E('div', { 'class': 'nym-mobile-uptime-label' }, 'Session'),
            mobileUptimeDisplay
        ]);

        // Connection chain (shown when connected)
        dotsSpan = E('span', { 'class': 'dots' });
        chainLabel = E('div', { 'class': 'nym-mobile-chain-label' }, [E('span', { 'class': 'text' }), dotsSpan]);
        chainRow = E('div', { 'class': 'nym-mobile-chain-row' });
        chainContainer = E('div', { 'class': 'nym-mobile-chain' }, [chainLabel, chainRow]);

        var container = E('div', { 'class': 'nym-mobile-gateway-tabs' }, [
            mobileUptimeContainer,
            chainContainer,
            E('div', { 'class': 'nym-mobile-tabs' }, [entryTab, exitTab]),
            contentArea
        ]);

        // Return API
        return {
            element: container,
            setConnecting: function() {
                isConnected = false;
                // Hide uptime during connecting
                if (mobileUptimeContainer) {
                    mobileUptimeContainer.style.display = 'none';
                }
                // Show chain with connecting state
                if (chainContainer) {
                    chainContainer.style.display = 'flex';
                    chainContainer.classList.remove('connected', 'disconnecting', 'fade-out');
                    chainContainer.classList.add('connecting');
                }
                var textSpan = chainLabel ? chainLabel.querySelector('.text') : null;
                if (textSpan) {
                    textSpan.textContent = 'Connecting';
                }
                startDotsAnimation();
                // Build a simple chain for animation
                if (chainRow) {
                    chainRow.innerHTML = '';
                    chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-node' }));
                    for (var i = 0; i < 3; i++) {
                        chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-line' }));
                        chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-node mixnet' }));
                    }
                    chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-line' }));
                    chainRow.appendChild(E('div', { 'class': 'nym-mobile-chain-node' }));
                }
                updateMode();
            },
            setConnected: function(entry, exit, hopCount) {
                isConnected = true;
                connectedEntry = entry;
                connectedExit = exit;
                // Show uptime when connected
                if (mobileUptimeContainer) {
                    mobileUptimeContainer.style.display = 'flex';
                }
                // Transition chain to connected state (keep it visible, just change colors)
                if (chainContainer) {
                    chainContainer.style.display = 'flex';
                    chainContainer.classList.remove('connecting', 'disconnecting', 'fade-out');
                    chainContainer.classList.add('connected');
                    // Update label and stop dots animation
                    var textSpan = chainLabel ? chainLabel.querySelector('.text') : null;
                    if (textSpan) {
                        textSpan.textContent = (hopCount === 2) ? 'Fast Mode' : 'Anonymous Mode';
                    }
                    stopDotsAnimation();
                    // Rebuild chain - always rebuild to ensure correct hop count
                    buildChain(hopCount || 5);
                }
                updateMode();
            },
            setDisconnecting: function() {
                // Show chain with disconnecting state
                if (chainContainer) {
                    chainContainer.classList.remove('connected', 'connecting', 'fade-out');
                    chainContainer.classList.add('disconnecting');
                }
                var textSpan = chainLabel ? chainLabel.querySelector('.text') : null;
                if (textSpan) {
                    textSpan.textContent = 'Disconnecting';
                }
                startDotsAnimation();
            },
            setDisconnected: function() {
                isConnected = false;
                connectedEntry = null;
                connectedExit = null;
                browseExpanded = { entry: false, exit: false };
                if (entryBrowseSection) entryBrowseSection.classList.add('collapsed');
                if (exitBrowseSection) exitBrowseSection.classList.add('collapsed');
                if (entryBrowseToggle) entryBrowseToggle.classList.remove('expanded');
                if (exitBrowseToggle) exitBrowseToggle.classList.remove('expanded');
                // Hide uptime
                if (mobileUptimeContainer) {
                    mobileUptimeContainer.style.display = 'none';
                }
                // Fade out chain then hide
                if (chainContainer) {
                    chainContainer.classList.add('fade-out');
                    setTimeout(function() {
                        chainContainer.style.display = 'none';
                        chainContainer.classList.remove('connecting', 'disconnecting', 'connected', 'fade-out');
                        stopDotsAnimation();
                    }, 400);
                }
                updateMode();
            },
            updateUptime: function(formattedTime) {
                if (mobileUptimeDisplay) {
                    mobileUptimeDisplay.textContent = formattedTime;
                }
            },
            getEntrySelect: function() {
                return entrySelectContainer ? entrySelectContainer.querySelector('select') : null;
            },
            getExitSelect: function() {
                return exitSelectContainer ? exitSelectContainer.querySelector('select') : null;
            },
            getEntryGatewayContainer: function() {
                return entryGatewayListContainer;
            },
            getExitGatewayContainer: function() {
                return exitGatewayListContainer;
            }
        };
    },
    formatUptime: function(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;

        var pad = function(n) { return n < 10 ? '0' + n : n; };

        if (hours > 0) {
            return pad(hours) + ':' + pad(minutes) + ':' + pad(secs);
        } else {
            return pad(minutes) + ':' + pad(secs);
        }
    },

    getStoredStartTime: function() {
        try {
            var stored = localStorage.getItem(this.UPTIME_STORAGE_KEY);
            return stored ? parseInt(stored, 10) : null;
        } catch (e) { return null; }
    },

    saveStartTime: function(time) {
        try {
            localStorage.setItem(this.UPTIME_STORAGE_KEY, time.toString());
        } catch (e) {}
    },

    clearStartTime: function() {
        try {
            localStorage.removeItem(this.UPTIME_STORAGE_KEY);
        } catch (e) {}
    },

    getQualityIcon: function(performance, assets) {
        var perf = (performance || '').toLowerCase();
        if (perf.indexOf('high') >= 0) return assets.qualityHigh;
        if (perf.indexOf('medium') >= 0) return assets.qualityMedium;
        if (perf.indexOf('offline') >= 0) return assets.qualityOffline;
        return assets.qualityLow;
    },

    renderGatewayInfo: function(container, name, id, ip, country, countryData) {
        if (!container) return;
        if (!name && !ip && !id) {
            container.innerHTML = '<div class="nym-gateway-empty">—</div>';
            return;
        }
        var flag = country ? (countryData[country] || {}).flag || '🌐' : '🌐';
        var html = '<div class="nym-gateway-flag">' + flag + '</div>';
        if (name) html += '<div class="nym-gateway-name" title="' + (name || '') + '">' + name + '</div>';
        if (id) html += '<div class="nym-gateway-id">' + id + '</div>';
        if (ip) html += '<div class="nym-gateway-ip">' + ip + '</div>';
        container.innerHTML = html;
    },

    createCountrySelect: function(countries, name, onSelect, getCountryDisplay) {
        var E = dom.create.bind(dom);
        var options = [E('option', { 'value': 'none' }, '— Select Country —')];
        options.push(E('option', { 'value': 'random' }, '🌐 Random'));

        countries.forEach(function(c) {
            var info = getCountryDisplay(c.code);
            options.push(E('option', { 'value': c.code },
                info.flag + ' ' + info.name + ' (' + c.count + ')'));
        });

        return E('select', {
            'class': 'nym-select',
            'name': name,
            'change': onSelect
        }, options);
    },

    createModalManager: function() {
        var activeModal = null;
        var E = dom.create.bind(dom);

        var hide = function() {
            if (activeModal && activeModal.parentNode) {
                activeModal.parentNode.removeChild(activeModal);
                activeModal = null;
            }
        };

        var show = function(title, message, icon) {
            hide();
            activeModal = E('div', { 'class': 'nym-modal-overlay' }, [
                E('div', { 'class': 'nym-modal' }, [
                    E('div', { 'class': 'nym-modal-ring' }, [
                        E('div', { 'class': 'nym-modal-ring-outer' }),
                        E('div', { 'class': 'nym-modal-ring-inner' }, [
                            E('div', { 'class': 'nym-modal-icon' }, icon || '◐')
                        ])
                    ]),
                    E('div', { 'class': 'nym-modal-title' }, title),
                    E('div', { 'class': 'nym-modal-message' }, message)
                ])
            ]);
            document.body.appendChild(activeModal);
        };

        var fadeOut = function(callback) {
            if (activeModal) {
                activeModal.classList.add('fade-out');
                setTimeout(function() {
                    hide();
                    if (callback) callback();
                }, 500);
            } else if (callback) {
                callback();
            }
        };

        var update = function(message) {
            if (activeModal) {
                var msgEl = activeModal.querySelector('.nym-modal-message');
                if (msgEl) msgEl.textContent = message;
            }
        };

        var setSuccess = function(title, message, icon) {
            if (activeModal) {
                activeModal.classList.add('success');
                var titleEl = activeModal.querySelector('.nym-modal-title');
                var msgEl = activeModal.querySelector('.nym-modal-message');
                var iconEl = activeModal.querySelector('.nym-modal-icon');
                if (titleEl && title) titleEl.textContent = title;
                if (msgEl && message) msgEl.textContent = message;
                if (iconEl && icon) iconEl.textContent = icon;
            }
        };

        var confirm = function(title, message, icon, onConfirm, onCancel, confirmText) {
            hide();
            activeModal = E('div', { 'class': 'nym-modal-overlay' }, [
                E('div', { 'class': 'nym-modal' }, [
                    E('div', { 'class': 'nym-modal-ring' }, [
                        E('div', { 'class': 'nym-modal-ring-outer nym-modal-ring-static' }),
                        E('div', { 'class': 'nym-modal-ring-inner' }, [
                            E('div', { 'class': 'nym-modal-icon' }, icon || '⚠')
                        ])
                    ]),
                    E('div', { 'class': 'nym-modal-title' }, title),
                    E('div', { 'class': 'nym-modal-message' }, message),
                    E('div', { 'class': 'nym-modal-buttons' }, [
                        E('button', {
                            'class': 'nym-btn nym-btn-primary',
                            'click': function() { hide(); if (onCancel) onCancel(); }
                        }, 'Cancel'),
                        E('button', {
                            'class': 'nym-btn nym-btn-danger',
                            'click': function() { if (onConfirm) onConfirm(); }
                        }, confirmText || 'Confirm')
                    ])
                ])
            ]);
            document.body.appendChild(activeModal);
        };

        return { show: show, hide: hide, fadeOut: fadeOut, update: update, setSuccess: setSuccess, confirm: confirm };
    },

    createToastManager: function() {
        var toastContainer = null;
        var E = dom.create.bind(dom);

        var ensureContainer = function() {
            if (!toastContainer || !toastContainer.parentNode) {
                toastContainer = E('div', { 'class': 'nym-toast-container' });
                document.body.appendChild(toastContainer);
            }
            return toastContainer;
        };

        var removeToast = function(toast) {
            if (toast && toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(function() {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 300);
            }
        };

        return {
            show: function(message, type) {
                var container = ensureContainer();
                var icons = { success: '✓', error: '✕', warning: '⚠' };
                var toast = E('div', { 'class': 'nym-toast ' + (type || 'success') }, [
                    E('span', { 'class': 'nym-toast-icon' }, icons[type] || '✓'),
                    E('span', { 'class': 'nym-toast-message' }, message),
                    E('button', { 'class': 'nym-toast-close', 'click': function() { removeToast(toast); } }, '×')
                ]);
                container.appendChild(toast);
                setTimeout(function() { removeToast(toast); }, 4000);
            }
        };
    }
});
