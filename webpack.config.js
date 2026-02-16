const path = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = {
	entry: {
		admin: './src/index.jsx',
		'taxonomy-terms-counter': './src/taxonomy-terms-counter.jsx',
	},

	output: {
		path: path.resolve( __dirname, 'assets/build' ),
		filename: '[name].js',
	},

	resolve: {
		extensions: [ '.js', '.jsx' ],
	},

	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'@wordpress/element': [ 'wp', 'element' ],
		'@wordpress/api-fetch': [ 'wp', 'apiFetch' ],
		'@wordpress/data': [ 'wp', 'data' ],
		'@wordpress/plugins': [ 'wp', 'plugins' ],
		'@wordpress/i18n': [ 'wp', 'i18n' ],
		'@wordpress/hooks': [ 'wp', 'hooks' ],
	},

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: {
					loader: 'babel-loader',
					options: { presets: [ '@babel/preset-react' ] },
				},
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				],
			},
		],
	},

	plugins: [ new MiniCssExtractPlugin( { filename: 'admin.css' } ) ],
};
