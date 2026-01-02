'use client';

import Script from 'next/script';

export default function AccessiBeWidget() {
    return (
        <Script
            src="https://acsbapp.com/apps/app/dist/js/app.js"
            strategy="lazyOnload"
            onLoad={() => {
                // @ts-ignore
                if (typeof acsbJS !== 'undefined') {
                    // @ts-ignore
                    acsbJS.init({
                        statementLink: '',
                        footerHtml: '',
                        hideMobile: false,
                        hideTrigger: false,
                        disableBgProcess: false,
                        language: 'tr',
                        position: 'right',
                        leadColor: '#146FF8',
                        triggerColor: '#146FF8',
                        triggerRadius: '50%',
                        triggerPositionX: 'right',
                        triggerPositionY: 'bottom',
                        triggerIcon: 'people',
                        triggerSize: 'medium',
                        triggerOffsetX: 20,
                        triggerOffsetY: 20,
                        mobile: {
                            triggerSize: 'small',
                            triggerPositionX: 'right',
                            triggerPositionY: 'bottom',
                            triggerOffsetX: 10,
                            triggerOffsetY: 10,
                            triggerRadius: '50%'
                        }
                    });
                }
            }}
        />
    );
}
