# Pesto

A front-end agnostic static site generator built on [metalsmith](https://github.com/metalsmith/metalsmith) and [gulp](https://github.com/gulpjs/gulp). Used to create sites for [Bistromath](https://bistromath.io)

## Getting Started

Clone the repo, install modules with `npm install` and then start adding your files. Configured to compile jade and markdown into html but these can be easily swapped out for any other frontend templating language (handlebars, stylus, etc). Uses scss for stylesheets.

## Running

Gulp will build your project, serve it in chrome and open it locally. Watchers are also set up with livereload to watch for changes and trigger an automatic update of assets and a page reload.
`gulp`

## Deploying to S3

Add your keys to aws.json and specify a bucket in the config object of gulpfile.js under the domain key. Alternatively you can add `params.Bucket` as follows

```
{
  "accessKeyId": YOUR_AWS_KEY,
  "secretAccessKey": YOUR_AWS_SECRET,
  "region": "eu-west-1",
  "params": {
  	"Bucket": BUCKET_NAME
  }
}
```
Run `gulp deploy` to push to S3. Be warned, _gulp-awspublish_ will remove any files in the bucket that aren't present in the build directory. Make sure you take backups.

## Advanced 

_policy.json_ gives and example of an S3 bucket policy to allow a single IP address access to the bucket. You can use this or generate your own policy based on your needs. S3 static site configuration is [well documented](http://docs.aws.amazon.com/gettingstarted/latest/swh/website-hosting-intro.html)
