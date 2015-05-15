requirejs.config({
    baseUrl: '_shadow_src',
    paths: {
        text: '_shadow_requirejs/require-text.js'
    }
});
require('entrypoint');
