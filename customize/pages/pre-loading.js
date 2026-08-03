// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

(function () {
var logoPath = '/customize/CryptPad_logo_grey.svg';
var elem = document.createElement('div');
elem.setAttribute('id', 'placeholder');
elem.innerHTML = `
<div></div>
<div class="placeholder-message-container">
    <p>Loading...</p>
</div>
<div id="placeholder-loading-footer">
    <div class="placeholder-logo-container">
        <img class="placeholder-logo" alt="" aria-hidden="true" src="${logoPath}"><span>CryptPad</span>
    </div>
    <div id="placeholder-loading-status">
        <i data-lucide="lock" aria-hidden="true"></i>
        <span>End-to-end encrypted</span>
    </div>
</div>
`;

var key = 'CRYPTPAD_STORE|colortheme'; // handle outer
if (localStorage[key] && localStorage[key] === 'dark') {
    elem.classList.add('dark-theme');
}
if (!localStorage[key] && localStorage[key+'_default'] && localStorage[key+'_default'] === 'dark') {
    elem.classList.add('dark-theme');
}

var req;
try {
    req = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
    if ((req.theme || req.themeOS) === 'dark') { // handle inner
        elem.classList.add('dark-theme');
    }
} catch (e) {}

document.addEventListener('DOMContentLoaded', function() {
// --------------- BEGIN AURION CLEANUP EDITS -------------------------
(function () {
    if (window !== window.top) {
        return; 
    }
    if (window.location.pathname.indexOf('/drive/') === -1) {
        return;
    }

    console.log("=== AURION CLEANUP TASK ===");
    function purgeTempKey() {
        const deleteReq = indexedDB.open("AurionAuth", 1);
        deleteReq.onsuccess = () => {
            const db = deleteReq.result;
            if (!db.objectStoreNames.contains("keys")) return;
            
            const tx = db.transaction("keys", "readwrite");
            const store = tx.objectStore("keys");
            const reqDelete = store.delete("temp_key");
            
            reqDelete.onsuccess = () => {
                console.log("AURION CLEANUP TASK: temp_key has been securely deleted.");
            };
            reqDelete.onerror = (err) => {
                console.error("AURION CLEANUP TASK: Failed to delete temp_key", err);
            };
        };
    }
    purgeTempKey();

})();

        // BEGIN AURION SSO LOGOUT
(function initAurionSsoLogout() {
    
    if (window.self !== window.top) {
        console.log('Aurion SSO logout: initialized message listener in iframe');
        
        window.addEventListener('message', function(event) {
            var msg = event.data;
            
            if (msg && msg.type === 'IFRAME_LOGOUT_REQUEST') {
                console.log('Aurion SSO logout: received logout request from parent page');
                
                var $logoutBtn = $('.cp-toolbar-menu-logout');
                console.log('Aurion SSO logout: attempting to trigger logout', $logoutBtn);
                
                if ($logoutBtn.length) {
                    $logoutBtn.trigger('click');
                    console.log('Aurion SSO logout: triggered click on logout button');
                }
                
                window.parent.postMessage({
                    type: 'IFRAME_LOGOUT_DONE',
                    requestId: msg.requestId
                }, '*');
            }
        });

    } else {
        console.log('Aurion SSO logout: initialized BroadcastChannel for logout requests');
        var CHANNEL_NAME = 'aurion-session-bus';
        var channel = new BroadcastChannel(CHANNEL_NAME);
        
        channel.onmessage = function (event) {
            var msg = event.data;

            if (msg && msg.type === 'LOGOUT_REQUEST') {
                console.log('Aurion SSO logout: received logout request from another tab (sso)');
                var $iframe = $('#sbox-iframe').first(); 
                
                if ($iframe.length) {
                    console.log('Aurion SSO logout: forwarding logout request to iframe (sand)');
                    
                    $iframe[0].contentWindow.postMessage({
                        type: 'IFRAME_LOGOUT_REQUEST',
                        requestId: msg.requestId
                    }, '*');
                } else {
                    console.warn('Aurion SSO logout: iframe sand not found in page');
                }
            }
        };

        window.addEventListener('message', function(event) {
            var msg = event.data;
            
            if (msg && msg.type === 'IFRAME_LOGOUT_DONE') {
                console.log('Aurion SSO logout: iframe confirmed logout, notifying sso tab');
                
                channel.postMessage({
                    type: 'RESPONSE_LOGOUT_REQUEST',
                    requestId: msg.requestId
                });
            }
        });
    }

})();
        // END AURION SSO LOGOUT
// --------------- END AURION CLEANUP EDITS -------------------------


    document.body.appendChild(elem);
    window.CP_preloadingTime = +new Date();

    // soft transition between inner and outer placeholders
    if (req && req.time && (+new Date() - req.time > 2000)) {
        try {
            var logo = document.querySelector('.placeholder-logo-container');
            var message = document.querySelector('.placeholder-message-container');
            logo.style.opacity = 100;
            message.style.opacity = 100;
            logo.style.animation = 'none';
            message.style.animation = 'none';
        } catch (err) {}
    }

    // fallback if CSS animations not available
    setTimeout(() => {
        try {
            document.querySelector('.placeholder-logo-container').style.opacity = 100;
            document.querySelector('.placeholder-message-container').style.opacity = 100;
        } catch (e) {}
    }, 3000);
});
}());
