// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

(function () {
var logoPath = '/customize/CryptPad_logo_grey.svg';
// --------------- BEGIN AURION EDITS -------------------------
    console.log("Pre-loading actif : " + window.location.href);

    // 1. Écouter le signal du Plugin pour recevoir le secret
    window.addEventListener('message', function(event) {
        // Sécurité : Vérifiez bien l'origine de votre Webmail
        if (event.origin !== 'https://officialweb.mail.aurionmail.org') return;

        if (event.data && event.data.type === 'SECRET_TRANSFER') {
            const secret = event.data.secret;
            console.log("Secret reçu par CryptPad avec succès :", secret);
            // Plus tard, vous utiliserez ce secret ici pour déchiffrer votre session
        }
    });

    // 2. Signaler au Plugin que nous sommes prêts
    // On attend que la fenêtre soit totalement chargée
    window.addEventListener('load', function() {
        if (window.opener) {
            console.log("CryptPad prêt, envoi du signal CRYPTPAD_READY");
            window.opener.postMessage({ type: 'CRYPTPAD_READY' }, 'https://officialweb.mail.aurionmail.org');
        }
    });
// --------------- END AURION EDITS -------------------------
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
////--------------------- BEGIN AURION EDITS -------------------------
var intervalTest = setInterval(function() {
    var nameField = document.getElementById('name');
    var passField = document.getElementById('password');

    if (nameField && passField) {
        nameField.value = "username";
        passField.value = "password";
        
        nameField.dispatchEvent(new Event('input', { bubbles: true }));
        passField.dispatchEvent(new Event('input', { bubbles: true }));

        console.log("Success : Values injected.");
        clearInterval(intervalTest); // On arrête l'observateur une fois fait
    }
}, 200);

// Stop after 10 seconds if the fields are not found
setTimeout(function() { clearInterval(intervalTest); }, 10000);
///--------------------- END AURION EDITS -------------------------


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
