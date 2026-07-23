// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

define([
    '/api/config',
    'jquery',
    '/common/hyperscript.js',
    '/common/common-interface.js',
    '/customize/messages.js',
    '/customize/pages.js'
], function (Config, $, h, UI, Msg, Pages) {

// --------------- BEGIN AURION EDITS -------------------------
(function() {
  let tempSecret = null;

  const req = indexedDB.open("DriveAuth", 1);
  req.onsuccess = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains("keys")){
      console.error("Attempting to load CryptDrive : error:", db);
      return;
    };
    const tx = db.transaction("keys", "readwrite");
    const store = tx.objectStore("keys");
    const getReq = store.get("temp_key");
    getReq.onsuccess = () => {
      console.log("IndexedDB retrieval result:", getReq.result);
      if (getReq.result) {
        tempSecret = getReq.result;
        window.CRYPTDRIVE_SECRET = tempSecret;
        startDOMObserver();
      }
    };
  };


  function startDOMObserver() {
    const observer = new MutationObserver((mutations, obs) => {
      const passField = document.getElementById('password');
      const confirmField = document.getElementById('passwordconfirm');
      const submitBtn = document.getElementById('cp-ssoauth-button');

      if (passField && window.CRYPTDRIVE_SECRET) {
        passField.value = window.CRYPTDRIVE_SECRET;
        if (confirmField) {
          confirmField.value = window.CRYPTDRIVE_SECRET;
        }

        passField.dispatchEvent(new Event('input', { bubbles: true }));
        if (confirmField) {
          confirmField.dispatchEvent(new Event('input', { bubbles: true }));
        }

        setTimeout(() => {
        if (submitBtn) {
          console.log("Executing automatic submit click.");
          submitBtn.click();
        } else {
          console.error("Submit button lost during timeout.");
        }  
      }, 5000);
        window.CRYPTDRIVE_SECRET = null;
        return;
      }
      const okModalBtn = document.querySelector('button.btn.ok.primary');
      if (okModalBtn) {
        console.log("Warning modal detected. Clicking OK button...");
        
        setTimeout(() => {
          okModalBtn.click();
          console.log("Success: Modal confirmed.");
        }, 2000);

        obs.disconnect();
        return;
      }

    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      if (window.CRYPTDRIVE_SECRET) {
        console.log("Timeout: Neither form nor session detected. Purging secret.");
        window.CRYPTDRIVE_SECRET = null;
      }
      observer.disconnect();
    }, 30000);
  }
})();
// --------------- END AURION EDITS -------------------------

    return function () {
        document.title = Msg.ssoauth_header;

        var frame = function (content) {
            return [
                h('div#cp-main', [
                    Pages.infopageTopbar(),
                    h('div.container.cp-container', [
                        h('div.row.cp-page-title', h('h1', Msg.ssoauth_header)),
                    ].concat(content)),
                    Pages.infopageFooter(),
                ]),
            ];
        };

        return frame([
          //BEGIN AURION EDITS
            h('div.row', [
                h('div.hidden.col-md-3'),
                
                h('div#loaderForm.col-md-6.cp-ssoauth-loader', [
                    h('div.spinner'),
                    h('p.loading-text', 'Connexion automatique en cours, veuillez patienter...'),
                    h('div.progress-bar-container', [
                        h('div.progress-bar-fill')
                    ])
                ]),

                // --- END AURION EDITS ---
                h('div#userForm.form-group.col-md-6.cp-ssoauth-pw', { style: 'display: none !important;' }, [
                    h('p.cp-isregister.cp-login-instance', Msg.ssoauth_form_hint_register),
                    h('p.cp-islogin.cp-login-instance', Msg.ssoauth_form_hint_login),
                    h('input.form-control#password', {
                        type: 'password',
                        placeholder: Msg.login_password,
                    }),
                    h('input.form-control.cp-isregister#passwordconfirm', {
                        type: 'password',
                        placeholder: Msg.login_confirm,
                    }),
                    h('div.cp-ssoauth-button.extra',
                        h('div'),
                        h('button.login#cp-ssoauth-button', Msg.continue)
                    )
                ]),
                h('div.hidden.col-md-3'),
            ])
        ]);
    };

});