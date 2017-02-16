const smWebpack = require('sm-webpack-config');

const config = {
	entry: 'src/index.js',
	dest: 'dist/index.js',
	library: 'vutils',
	libraryFormat: 'es',
	uglify: false,
	sourceMap: false,
};

smWebpack.runRollup({config}).then(() => {
	console.log("Done!");
});
