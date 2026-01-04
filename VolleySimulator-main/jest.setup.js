import '@testing-library/jest-dom'

// Polyfill for Request/Response (needed for next/server during tests)
if (typeof Request === 'undefined') {
    global.Request = class Request {
        constructor(input, init) {
            this.input = input;
            this.init = init;
        }
    };
}

if (typeof Response === 'undefined') {
    global.Response = class Response {
        constructor(body, init) {
            this.body = body;
            this.init = init;
        }
        static json(data, init) {
            return new Response(JSON.stringify(data), init);
        }
    };
}

if (typeof TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}
