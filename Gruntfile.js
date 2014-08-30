var remapify = require('remapify');

module.exports = function(grunt) {

	grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      before: ["app/server/public"]
    },

    copy: { 
      client: {
  	    files: [
  	    	{ expand: true, 
            cwd: 'app/client', 
            src: ['**/*', '!/js'], 
            dest: 'app/server/public' 
          }
  	    ]
      }
    },

    browserify: {
    	 client: {
	        src: ['app/client/js/**/*.js'],
	        dest: 'app/client/client.js',
        	options: {
          		watch: true
        	}
      	}
    },

    watch: {
      client: {
        files: ['app/client/client.js', 'app/client/index.html', 'app/shared/**/*.*'],
        tasks: ['clean:before', 'copy:client', 'jshint'],
        options: {
        	livereload: true
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'app/client/js/**/*.js', 'app/shared/**/*.js', '!app/client/js/vendor/**/*.*'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

  grunt.registerTask('testServer', [
      'browserify:client',
      'watch'
    ]);


};