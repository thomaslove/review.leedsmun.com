// =========================================================
// pesto gulpfile.js v2.0
// =========================================================

// ------------------------------------------------- Requires

var gulp = require('gulp'),
	rename = require('gulp-rename'),
	livereload = require('gulp-livereload'),
	del	= require('del'),
	fs = require('fs'),

	sass = require('gulp-sass'),
	cssmin = require('gulp-cssmin'),

	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),

	metalsmith = require('metalsmith'),
	markdown = require('metalsmith-markdown'),
	jade = require('metalsmith-jade'),
	layouts = require('metalsmith-layouts'),

	favicons = require('gulp-favicons'),

	webserver = require('gulp-webserver'),
	opn       = require('opn'),

	awspublish = require('gulp-awspublish'),
	expect = require('gulp-expect-file'),
	error = require('pipe-error-stop');

// ------------------------------------------------- Configuration

var aws = JSON.parse(fs.readFileSync('./aws.json'));

var server = {
  host: 'localhost',
  port: '4242'
}

var config = {
	domain: 'review.leedsmun.com',
	background: '#000',
	sass: {
		src: 'scss/*.{scss,sass}',
		dest: 'build/assets/css'
	}, 
	scripts: {
		src: 'scripts/**/*.js',
		dest: 'build/assets/js'
	},
	metalsmith: {
		src: 'content',
		tmp: '.ms',
		dest: 'build',
		watch: ['content', 'layouts']
	},
	assets: {
		src: 'assets/**/*',
		dest: 'build/assets'
	},
	favicon: {
		src: 'logo.png',
		dest: 'build/assets/icons'
	}
};

// ------------------------------------------------- Tasks

gulp.task('sass', function () {
	return gulp.src(config.sass.src)
		.pipe(sass().on('error', sass.logError))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(config.sass.dest))
		.pipe(livereload());
});

gulp.task('scripts', function () {
	return gulp.src(config.scripts.src)
		.pipe(uglify())
		.pipe(concat('main'))
		.pipe(rename({ extname: '.min.js'}))
		.pipe(gulp.dest(config.scripts.dest))
		.pipe(livereload());
});

gulp.task('metalsmith:run', function (done) {
	metalsmith(__dirname)
	.source(config.metalsmith.src)
	.destination(config.metalsmith.tmp)
	.use(markdown())
	.use(jade())
	.use(layouts('jade'))
	.build(function(err){
		if(err) return done(err);
		done();
	});
});

// This fixes two issues. Metalsmith tries to override the entire contents of the build directory
// so we need to compile to a separate directory and copy it in. Additionally there's no metalsmith
// livereload support afaik, so we can tack it on to the end of the move task.

gulp.task('metalsmith:move', function () {
	return gulp.src(config.metalsmith.tmp+'/**/*')
		.pipe(gulp.dest(config.metalsmith.dest))
		.pipe(livereload());
});

gulp.task('metalsmith', gulp.series('metalsmith:run', 'metalsmith:move'));

gulp.task('assets', function () {
	return gulp.src(config.assets.src)
		.pipe(gulp.dest(config.assets.dest));
});

gulp.task('favicon', function () {
	return gulp.src(config.favicon.src)
		.pipe(favicons({
			background: config.background,
			icons: {
				android: false,
				appleIcon: true,
				appleStartup: false,
				coast: false,
				favicons: true,
				firefox: false,
				opengraph: true,
				twitter: true,
				windows: true,
				yandex: false
			}
		}))
		.pipe(gulp.dest(config.favicon.dest));
});

gulp.task('clean', function () {
	return del('build');
});

gulp.task('build', gulp.series('clean', 'metalsmith', 'assets', 'favicon', 'sass', 'scripts'));


// ------------------------------------------------- Watchers

gulp.task('watch', function () {
	livereload.listen();
	gulp.watch(config.sass.src, gulp.series('sass'));
	gulp.watch(config.scripts.src, gulp.series('scripts'));
	gulp.watch(config.metalsmith.watch, gulp.series('metalsmith'));
	gulp.watch(config.assets.src, gulp.series('assets'));
});

// ------------------------------------------------- Development Server

gulp.task('webserver', function() {
  gulp.src( './build' )
    .pipe(webserver({
      host:             server.host,
      port:             server.port,
      livereload:       true,
      directoryListing: false
    }));
});

gulp.task('openbrowser', function() {
  opn( 'http://' + server.host + ':' + server.port, {app: 'google chrome'});
});

// ------------------------------------------------- Uploading

gulp.task('upload', function () {
	var publisher = awspublish.create(aws);
	aws.params = aws.params || {};
	aws.params.Bucket = aws.params.bucket || config.domain;
	
	return gulp.src('build/**')
		.pipe(expect({ reportUnexpected: false }, 'build/index.html'))
		.pipe(error())
		.pipe(publisher.publish())
		.pipe(publisher.sync())
		.pipe(awspublish.reporter())
});

// ------------------------------------------------- Default

gulp.task('default', gulp.series('build', gulp.parallel('webserver', 'openbrowser', 'watch')));

gulp.task('deploy', gulp.series('build', 'upload'));